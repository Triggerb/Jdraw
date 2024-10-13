// commands/javaToModelingLanguage.ts
import * as vscode from 'vscode';
import {
    extractClassDetails,
    generateIntermediateLanguage,
} from '../utils';

export function javaToModelingLanguageCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('jdraw.javaToModelingLanguage', async () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const javaCode = editor.document.getText();
            try {
                const javaParser = await import('java-parser');
                const ast = javaParser.parse(javaCode);
                const classDetails = extractClassDetails(ast);

                vscode.window.showInformationMessage('Analyse Java réussie.');

                // Générer le langage intermédiaire
                const intermediateModel = generateIntermediateLanguage(classDetails);
                console.log('\nLangage de modélisation généré:\n');
                console.log(intermediateModel);

                // Optionnel : Enregistrer ou afficher le langage intermédiaire dans une vue dédiée

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
