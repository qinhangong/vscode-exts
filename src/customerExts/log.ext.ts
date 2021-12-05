import * as vscode from 'vscode';

const logExt = vscode.commands.registerCommand('magic-log', () => {
  const currentEditor = vscode.window.activeTextEditor;
  if (!currentEditor) {
    return;
  }
  const reg = /(\S+)(\.log)$/;
  const { selection, document } = currentEditor;
  const position = document.getWordRangeAtPosition(selection.anchor, reg);
  if (!position) {
    return vscode.window.showInformationMessage('please codeing like this: xxx.log');
  }

  const docText = document.getText(position);
  const tempArr = reg.exec(docText);
  const prefix = tempArr && tempArr[1];
  const replaceText = `console.log('${prefix}========',${prefix});`;

  currentEditor
    .edit((editer) => {
      editer.replace(position, replaceText);
    })
    .then(() => {
      const line = position.start.line;
      const index = document.lineAt(line).firstNonWhitespaceCharacterIndex;

      currentEditor.selection = new vscode.Selection(
        new vscode.Position(line, replaceText.length + index), 
        new vscode.Position(line, replaceText.length + index)
        );
    });
});

export default logExt;



/**
 * 需求背景
 * xxx.log 输入
 * console.log('xxx========',xxx); 输出
*/

/**
 * 实现方案
 * 获取当前激活的编辑器 activeTextEditor
 * 记录当前光标的位置
 * 获取用户输入的文本
 * 对符合规则的文本进行替换
*/