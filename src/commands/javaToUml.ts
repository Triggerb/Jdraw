// commands/javaToUml.ts
import * as vscode from 'vscode';
import {
    extractClassDetails,
    displayClassDetails,
    generatePlantUML,
} from '../utils';

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

                // Afficher les classes trouvées de manière organisée
                displayClassDetails(classDetails);

                // Générer le code PlantUML
                const umlCode = generatePlantUML(classDetails);
                console.log('\nCode PlantUML généré:\n');
                console.log(umlCode);

                // Optionnel : Enregistrer ou afficher le code UML dans une vue dédiée

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
