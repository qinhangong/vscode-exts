import * as vscode from 'vscode';
import logExt from './customerExts/log.ext';
import apiExt from './customerExts/api.ext';
import dataExt from './customerExts/data.ext';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(logExt);
  context.subscriptions.push(apiExt);
  context.subscriptions.push(dataExt);
}

export function deactivate() {}
