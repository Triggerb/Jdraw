// commands/javaToUml.ts
import * as vscode from 'vscode';
import { extractClassDetails } from '../utils';
import { generateDrawioXML } from '../drawUtils';
import * as fs from 'fs';
import * as path from 'path';

export function javaToUmlCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('jdraw.javaToUml', async () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const javaCode = editor.document.getText();
            try {
                const javaParser = await import('java-parser');
                const ast = javaParser.parse(javaCode);
                const classDetails = extractClassDetails(ast);

                vscode.window.showInformationMessage('Analyse Java réussie.');

                // Générer le XML Draw.io
                const xmlContent = generateDrawioXML(classDetails);

                // Sauvegarder le contenu XML dans un fichier .drawio
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders) {
                    const workspaceRoot = workspaceFolders[0].uri.fsPath;
                    const filePath = path.join(workspaceRoot, 'diagram.drawio');
                    fs.writeFileSync(filePath, xmlContent, 'utf8');
                    vscode.window.showInformationMessage(`Diagramme UML Draw.io sauvegardé à ${filePath}`);

                    // Ouvrir le fichier dans l'éditeur Draw.io
                    const document = await vscode.workspace.openTextDocument(filePath);
                    await vscode.window.showTextDocument(document);

                } else {
                    vscode.window.showErrorMessage('Aucun dossier ouvert pour sauvegarder le diagramme.');
                }

            } catch (error) {
                vscode.window.showErrorMessage('Erreur lors de l\'analyse du code Java.');
                console.error('Détails de l\'erreur:', error);
            }
        } else {
            vscode.window.showInformationMessage('Aucun fichier Java ouvert.');
        }
    });

    context.subscriptions.push(disposable);
}
