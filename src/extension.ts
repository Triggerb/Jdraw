// extension.ts
import * as vscode from 'vscode';
import { javaToUmlCommand } from './commands/javaToUml';
import { javaToModelingLanguageCommand } from './commands/javaToModelingLanguage';
// Importer d'autres commandes si nécessaire

export function activate(context: vscode.ExtensionContext) {
    javaToUmlCommand(context);
    javaToModelingLanguageCommand(context);
    // Enregistrer d'autres commandes ici, par exemple :
    // umlToJavaCommand(context);
    // umlToModelingLanguageCommand(context);
}

export function deactivate() {}
