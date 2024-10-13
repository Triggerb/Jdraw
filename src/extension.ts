// extension.ts
import * as vscode from 'vscode';
import { javaToUmlCommand } from './commands/javaToUml';
import { javaToModelingLanguageCommand } from './commands/javaToModelingLanguage';
// Autres commandes si nécessaire

export function activate(context: vscode.ExtensionContext) {
    javaToUmlCommand(context);
    javaToModelingLanguageCommand(context);
    // Enregistrer d'autres commandes ici
}

export function deactivate() {}
