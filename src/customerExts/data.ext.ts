import axios from 'axios';
import * as vscode from 'vscode';

const dataExt = vscode.commands.registerCommand('magic-data', () => {
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
      let end;
      let requestData: any;
      let insertStr: string = '';
      if (method === 'get') {
        requestData = paths[url][method]['parameters'];
        requestData.forEach((item: any) => {
          const { name, description } = item;
          insertStr += `${name}: undefined, // ${description || ''} \n`;
        });
        end = new vscode.Position(start.line + requestData.length, 0);
      }

      if (method === 'post') {
        requestData = paths[url][method]['requestBody']['content']['application/json']['schema']['properties'];
        Object.keys(requestData).forEach((key) => {
          const { default: defaultValue, description } = requestData[key];
          insertStr += `${key}: ${defaultValue}, // ${description || ''} \n`;
        });
        end = new vscode.Position(start.line + Object.keys(requestData).length, 0);
      }

      if (start && end) {
        const selection = new vscode.Selection(start, end);
        currentEditor.insertSnippet(new vscode.SnippetString(insertStr));
        currentEditor.selection = selection;
        vscode.commands.executeCommand('editor.action.formatSelection');
      }
    });
  });
});

export default dataExt;

/**
 * 根据接口文档在编辑器中自动生成请求参数(任何前端框架都可以使用)
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
