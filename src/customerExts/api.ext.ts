import axios from 'axios';
import * as vscode from 'vscode';

const dataExt = vscode.commands.registerCommand('magic-api', () => {
  const currentEditor = vscode.window.activeTextEditor;
  if (!currentEditor) {
    return;
  }
  vscode.window.showInputBox().then((value) => {
    if (!value) {
      return;
    }
    const { document, selection } = currentEditor;
    axios.get(value).then((res: any) => {
      const start = selection.start;
      const { paths } = res.data;
      const url = Object.keys(paths)[0];
      const method = Object.keys(paths[url])[0];
      const title = paths[url][method].summary;
      let insertFunction: string = '';

      const insertComment = `/**\n * 接口名称: ${title}\n * 接口文档地址: ${value}\n*/\n`;
      const funcName = url
        .split('/')
        .slice(1)
        .map((item: any, index: number) => {
          if (index === 0) {
            return item;
          }
          return item.slice(0, 1).toUpperCase() + item.slice(1);
        })
        .join('');
      const newStart = new vscode.Position(start.line + 4, 0); // 注释下面算真正的开始

      insertFunction = `export const ${funcName} = data => {
          return request.${method}({ url: '${url}', data });
      };`;
      const end = new vscode.Position(newStart.line + 3, 0);
      if (newStart && end) {
        currentEditor.insertSnippet(new vscode.SnippetString(insertComment + insertFunction));
        const selection = new vscode.Selection(newStart, end);
        currentEditor.selection = selection;
        vscode.commands.executeCommand('editor.action.formatSelection');
      }
    });
  });
});

export default dataExt;

/**
 * 根据接口文档在编辑器中自动生成请求方法(任何前端框架都可以使用)
 * 让生成的代码自动格式化并不影响之前的代码
 */

/**
 * 实现方案
 * 编辑器窗口调起输入框并输入接口文档地址
 * 获取当前激活的编辑器，记录当前光标的位置
 * 请求接口文档并解析，生成对应的代码片段
 * 将代码片段插入到光标所在位置
 * 将插入的代码选中并格式化选中的代码
 */
