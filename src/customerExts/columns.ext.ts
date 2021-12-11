import * as fs from 'fs';
import * as path from 'path';
const axios = require('axios');
import * as vscode from 'vscode';

const columnsExt = (context: any) => {
  return vscode.commands.registerCommand('magic-columns', () => {
    let lineNum: any;
    let insertStr = '';
    const currentEditor = vscode.window?.activeTextEditor;
    const document = currentEditor?.document;
    if (!currentEditor) {
      return vscode.window.showErrorMessage('请获取tab焦点');
    }
    const start = currentEditor?.selection.start;
    const web = vscode.window.createWebviewPanel(
      'myWebview', // viewType
      'magic-columns', // 视图标题
      vscode.ViewColumn.One, // 显示在编辑器的第一分屏
      {
        enableScripts: true, // 启用JS，默认禁用
        retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
      }
    );

    web.webview.onDidReceiveMessage(
      (message) => {
        console.log('插件收到的消息：', message);
        const { path, filed, type, columns } = message || {};
        if (type === 'get-columns') {
          axios.get(path).then((res: any) => {
            const { paths } = res.data;
            const url = Object.keys(paths)[0];
            const method = Object.keys(paths[url])[0];
            const { responses } = paths[url][method];
            const { data } = responses['200']['content']['application/json']['schema']['properties'];
            const columnsData = data[filed].properties;
            const columns = Object.entries(columnsData).map(([key, item]) => {
              // @ts-ignore
              return { key, desc: item.description };
            });
            web.webview.postMessage(columns);
          });
        }
        if (type === 'set-columns') {
          const startstr = '[\n';
          const endstr = ']\n';
          const objstr = columns.map((item: any, index: number) => {
            let str = '{' + 'key:' + `'${item.key}'` + ',\n' + 'dataIndex:' + `'${item.key}'` + ',\n' + 'title:' + `'${item.title}'` + ',\n';
            if (item.render) {
              str += `render: ${item.render}`;
            }
            str += `}${index === columns.length - 1 ? '' : ','}\n`;
            return str;
          });
          lineNum = columns.length * 4 + 3;
          insertStr = startstr + objstr.join('') + endstr;
          web.dispose();
        }
      },
      undefined,
      context.subscriptions
    );

    web.onDidDispose((e) => {
      if (document?.isClosed) {
        return vscode.window.showErrorMessage('sorry, the file was closed');
      }
      document && vscode.window.showTextDocument(document); // 先让显示当前的document，因为用户可能在操作webview的过程中切换了document
      setTimeout(() => {
        const editor = vscode.window.activeTextEditor;
        const end = new vscode.Position(start.line + lineNum, 0);
        if (editor && start && end) {
          const selection = new vscode.Selection(start, end);
          editor.insertSnippet(new vscode.SnippetString(insertStr));
          editor.selection = selection;
          vscode.commands.executeCommand('editor.action.formatSelection');
        }
      }, 100);
    });

    const dir = path.join(context.extensionPath, 'client/dist'); // 静态资源的绝对目录
    // webview不能直接识别硬盘的路径，所以要进行以下转换
    const uri = vscode.Uri.file(dir);
    const baseUri = web.webview.asWebviewUri(uri);
    const htmlPath = path.join(dir, 'index.html');
    let indexHtml = fs.readFileSync(htmlPath, 'utf8');
    indexHtml = indexHtml.replace(`<base href="/">`, `<base href="${String(baseUri)}/">`); // index.heml中需要有<base href="/">标签
    web.webview.html = indexHtml;
  });
};

export default columnsExt;
