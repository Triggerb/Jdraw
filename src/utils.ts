// utils.ts
export interface ClassDetails {
    className: string;
    fields: FieldDetails[];
    methods: MethodDetails[];
    modifiers: string[];
    extends?: string;
    implements?: string[];
}

export interface FieldDetails {
    name: string;
    type: string;
    modifiers: string[];
}

export interface MethodDetails {
    name: string;
    returnType: string;
    parameters: ParameterDetails[];
    modifiers: string[];
}

export interface ParameterDetails {
    name: string;
    type: string;
}

export interface Relation {
    relationId: string;
    from: string;
    to: string;
    type: string; // 'association', 'inheritance', 'implementation'
    cardinalityFrom?: string;
    cardinalityTo?: string;
}

// Fonction pour extraire les classes, attributs, méthodes et modificateurs depuis l'AST Java
export function extractClassDetails(ast: any): ClassDetails[] {
    const classes: ClassDetails[] = [];

    const compilationUnit = ast?.children?.ordinaryCompilationUnit?.[0];
    if (!compilationUnit) {
        return classes;
    }

    const typeDeclarations = compilationUnit?.children?.typeDeclaration || [];
    typeDeclarations.forEach((typeDecl: any) => {
        const classDecl = typeDecl.children?.classDeclaration?.[0]?.children?.normalClassDeclaration?.[0];
        if (classDecl) {
            const className =
                classDecl.children?.typeIdentifier?.[0]?.children?.Identifier?.[0]?.image ||
                'Classe inconnue';

            const classBody = classDecl.children?.classBody?.[0];
            const fields: FieldDetails[] = [];
            const methods: MethodDetails[] = [];
            const classModifiers = extractModifiers(typeDecl.children?.classDeclaration?.[0]);

            // Extraction des relations d'héritage et d'implémentation
            const extendsClass =
                classDecl.children?.superclass?.[0]?.children?.classType?.[0]?.children?.Identifier?.[0]
                    ?.image;
            const implementsInterfaces = classDecl.children?.superinterfaces?.[0]?.children?.interfaceTypeList?.[0]?.children?.interfaceType?.map(
                (iface: any) => {
                    return iface.children?.Identifier?.[0]?.image;
                }
            );

            classBody?.children?.classBodyDeclaration?.forEach((bodyDecl: any) => {
                const memberDecl = bodyDecl.children?.classMemberDeclaration?.[0];

                // Attributs
                const fieldDecl = memberDecl?.children?.fieldDeclaration?.[0];
                if (fieldDecl) {
                    const fieldName =
                        fieldDecl.children?.variableDeclaratorList?.[0]?.children?.variableDeclarator?.[0]?.children
                            ?.variableDeclaratorId?.[0]?.children?.Identifier?.[0]?.image;
                    const fieldType = extractType(fieldDecl.children?.unannType?.[0]);
                    const fieldModifiers = extractModifiers(fieldDecl);

                    if (fieldName) {
                        fields.push({
                            name: fieldName,
                            type: fieldType,
                            modifiers: fieldModifiers,
                        });
                    }
                }

                // Méthodes
                const methodDecl = memberDecl?.children?.methodDeclaration?.[0];
                if (methodDecl) {
                    const methodName =
                        methodDecl.children?.methodHeader?.[0]?.children?.methodDeclarator?.[0]?.children
                            ?.Identifier?.[0]?.image;
                    const returnType = extractType(
                        methodDecl.children?.methodHeader?.[0]?.children?.result?.[0]?.children?.unannType?.[0]
                    );
                    const methodModifiers = extractModifiers(methodDecl);
                    const parameters = extractMethodParameters(methodDecl);

                    if (methodName) {
                        methods.push({
                            name: methodName,
                            returnType: returnType,
                            parameters: parameters,
                            modifiers: methodModifiers,
                        });
                    }
                }
            });

            classes.push({
                className,
                fields,
                methods,
                modifiers: classModifiers,
                extends: extendsClass,
                implements: implementsInterfaces,
            });
        }
    });

    return classes;
}

// Extrait le type depuis un nœud unannType ou result
export function extractType(typeNode: any): string {
    if (!typeNode) return 'void';

    const primitiveTypeWithSuffix = typeNode.children?.unannPrimitiveTypeWithOptionalDimsSuffix?.[0];
    if (primitiveTypeWithSuffix) {
        const primitiveTypeNode = primitiveTypeWithSuffix.children?.unannPrimitiveType?.[0];
        if (primitiveTypeNode) {
            const numericTypeNode = primitiveTypeNode.children?.numericType?.[0];
            if (numericTypeNode) {
                const integralTypeNode = numericTypeNode.children?.integralType?.[0];
                if (integralTypeNode) {
                    const typeName = Object.keys(integralTypeNode.children)[0];
                    return typeName?.toLowerCase() || 'Type numérique inconnu';
                }

                const floatingPointTypeNode = numericTypeNode.children?.floatingPointType?.[0];
                if (floatingPointTypeNode) {
                    const typeName = Object.keys(floatingPointTypeNode.children)[0];
                    return typeName?.toLowerCase() || 'Type numérique inconnu';
                }
            }

            if (primitiveTypeNode.children?.Boolean?.[0]) {
                return 'boolean';
            }

            if (primitiveTypeNode.children?.Char?.[0]) {
                return 'char';
            }

            return 'Type primitif inconnu';
        }
    }

    const referenceTypeNode = typeNode.children?.unannReferenceType?.[0];
    if (referenceTypeNode) {
        const classOrInterfaceTypeNode = referenceTypeNode.children?.unannClassOrInterfaceType?.[0];
        const classTypeNode = classOrInterfaceTypeNode?.children?.unannClassType?.[0];
        const typeName = classTypeNode?.children?.Identifier?.[0]?.image;
        return typeName || 'Type référence inconnu';
    }

    return 'Type inconnu';
}

// Extrait les modificateurs d'un nœud
export function extractModifiers(node: any): string[] {
    const modifiers: string[] = [];
    const modList =
        node?.children?.fieldModifier ||
        node?.children?.methodModifier ||
        node?.children?.classModifier ||
        [];
    modList.forEach((mod: any) => {
        const modifierKey = Object.keys(mod.children)[0];
        const modifier = mod.children[modifierKey]?.[0]?.image;
        if (modifier) {
            modifiers.push(modifier);
        }
    });
    return modifiers;
}

// Extrait les paramètres des méthodes avec leurs types
export function extractMethodParameters(methodDecl: any): ParameterDetails[] {
    const parameters: ParameterDetails[] = [];
    const formalParameterList =
        methodDecl.children?.methodHeader?.[0]?.children?.methodDeclarator?.[0]?.children
            ?.formalParameterList?.[0];

    if (formalParameterList) {
        const formalParameters =
            formalParameterList.children?.formalParameters?.[0]?.children?.formalParameter ||
            formalParameterList.children?.formalParameter;
        const params = Array.isArray(formalParameters) ? formalParameters : [formalParameters];

        params.forEach((param: any) => {
            const paramDecl = param.children?.variableDeclaratorId?.[0];
            const paramName = paramDecl?.children?.Identifier?.[0]?.image;
            const paramTypeNode = param.children?.unannType?.[0];
            const paramType = extractType(paramTypeNode);

            if (paramName) {
                parameters.push({
                    name: paramName,
                    type: paramType,
                });
            }
        });
    }

    return parameters;
}

// Fonction pour afficher les détails des classes de manière organisée
export function displayClassDetails(classDetails: ClassDetails[]) {
    classDetails.forEach((classDetail) => {
        console.log(`\nClasse: ${classDetail.className}`);
        if (classDetail.modifiers.length > 0) {
            console.log(`  Modificateurs: ${classDetail.modifiers.join(', ')}`);
        }
        if (classDetail.fields.length > 0) {
            console.log('  Attributs:');
            classDetail.fields.forEach((field) => {
                const modifiers = field.modifiers.length > 0 ? `[${field.modifiers.join(', ')}]` : '';
                console.log(`    - ${field.name}: ${field.type} ${modifiers}`);
            });
        }
        if (classDetail.methods.length > 0) {
            console.log('  Méthodes:');
            classDetail.methods.forEach((method) => {
                const params = method.parameters.map((p) => `${p.type} ${p.name}`).join(', ');
                const modifiers = method.modifiers.length > 0 ? `[${method.modifiers.join(', ')}]` : '';
                console.log(`    - ${method.name}(${params}): ${method.returnType} ${modifiers}`);
            });
        }
    });
}

// Fonction pour générer du code PlantUML à partir des détails des classes
export function generatePlantUML(classDetails: ClassDetails[]): string {
    let uml = '@startuml\n\n';
    classDetails.forEach((classDetail) => {
        const classType = classDetail.modifiers.includes('interface') ? 'interface' : 'class';
        const isAbstract = classDetail.modifiers.includes('abstract') ? 'abstract ' : '';
        uml += `${isAbstract}${classType} ${classDetail.className} {\n`;

        classDetail.fields.forEach((field) => {
            const visibility = mapModifierToVisibility(field.modifiers);
            uml += `  ${visibility} ${field.name} : ${field.type}\n`;
        });

        classDetail.methods.forEach((method) => {
            const visibility = mapModifierToVisibility(method.modifiers);
            const params = method.parameters.map((p) => `${p.name} : ${p.type}`).join(', ');
            uml += `  ${visibility} ${method.name}(${params}) : ${method.returnType}\n`;
        });

        uml += '}\n\n';
    });

    // Ajout des relations (héritage et implémentation)
    classDetails.forEach((classDetail) => {
        if (classDetail.extends) {
            uml += `${classDetail.extends} <|-- ${classDetail.className}\n`;
        }
        if (classDetail.implements) {
            classDetail.implements.forEach((iface) => {
                uml += `${iface} <|.. ${classDetail.className}\n`;
            });
        }
    });

    uml += '@enduml';
    return uml;
}

// Fonction pour mapper les modificateurs de visibilité aux symboles PlantUML
export function mapModifierToVisibility(modifiers: string[]): string {
    if (modifiers.includes('public')) return '+';
    if (modifiers.includes('private')) return '-';
    if (modifiers.includes('protected')) return '#';
    return '~'; // package-private ou sans modificateur
}

// Fonction pour générer le langage intermédiaire
export function generateIntermediateLanguage(classDetails: ClassDetails[]): string {
    let entities = '';
    let relations = '';
    let relationCounter = 1;

    const relationList: Relation[] = [];

    // Déclaration des entités
    classDetails.forEach((classDetail) => {
        const attributes = classDetail.fields.map((field) => `${field.name}: ${field.type}`).join(', ');
        entities += `E(${classDetail.className}, ${attributes})\n`;
    });

    // Détection des relations
    classDetails.forEach((classDetail) => {
        // Héritage
        if (classDetail.extends) {
            const relationId = `R${relationCounter++}`;
            relations += `${relationId}(${classDetail.className}, ${classDetail.extends}) : ${classDetail.className} <> ${classDetail.extends} [1..1]\n`;
            relationList.push({
                relationId,
                from: classDetail.className,
                to: classDetail.extends,
                type: 'inheritance',
                cardinalityFrom: '1..1',
                cardinalityTo: '1..1',
            });
        }

        // Implémentation d'interfaces
        if (classDetail.implements) {
            classDetail.implements.forEach((iface) => {
                const relationId = `R${relationCounter++}`;
                relations += `${relationId}(${classDetail.className}, ${iface}) : ${classDetail.className} ..|> ${iface} [1..1]\n`;
                relationList.push({
                    relationId,
                    from: classDetail.className,
                    to: iface,
                    type: 'implementation',
                    cardinalityFrom: '1..1',
                    cardinalityTo: '1..1',
                });
            });
        }

        // Associations via les attributs
        classDetail.fields.forEach((field) => {
            // Vérifier si le type de l'attribut est une autre classe
            if (classDetails.some((cls) => cls.className === field.type)) {
                const relationId = `R${relationCounter++}`;
                relations += `${relationId}(${classDetail.className}, ${field.type}) : ${classDetail.className} -> ${field.type} [1..*]\n`;
                relationList.push({
                    relationId,
                    from: classDetail.className,
                    to: field.type,
                    type: 'association',
                    cardinalityFrom: '1..*',
                    cardinalityTo: '1..1',
                });
            }
        });
    });

    // Compilation du modèle complet
    const model = `${entities}\n${relations}`;
    return model;
}
