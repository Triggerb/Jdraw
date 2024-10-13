// drawUtils.ts

import { ClassDetails, mapModifierToVisibility } from './utils';

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return '';
        }
    });
}

export function generateDrawioXML(classDetails: ClassDetails[]): string {
    // Initialize XML structure
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram id="diagramId" name="UML Diagram">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1"
      tooltips="1" connect="1" arrows="1" fold="1" page="1"
      pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
`;

    let cellId = 2; // Cell IDs start from 2
    let x = 40; // Initial X position
    let y = 10; // Initial Y position
    const width = 140;

    const classCellIds: { [className: string]: number } = {};
    const classNames = classDetails.map(cd => cd.className);

    // Generate cells for each class
    classDetails.forEach((classDetail) => {
        const id = cellId++;
        classCellIds[classDetail.className] = id;

        // Determine the stereotype
        let stereotypeText = '';
        if (classDetail.modifiers.includes('interface')) {
            stereotypeText = '&lt;&lt;interface&gt;&gt;\n';
        } else if (classDetail.modifiers.includes('abstract')) {
            stereotypeText = '&lt;&lt;abstract&gt;&gt;\n';
        }

        // Build the label using styled HTML
        let label = `${stereotypeText}${classDetail.className}`;

        // Escape XML special characters
        label = escapeXml(label);

        // Build the style string
        let style = 'swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=26;';
        style += 'horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;';
        style += 'collapsible=1;marginBottom=0;fillColor=#f5f5f5;fontColor=#333333;';
        style += 'strokeColor=#666666;';

        // Calculate the total height of the class cell based on the number of attributes and methods
        const attributeCount = classDetail.fields.length;
        const methodCount = classDetail.methods.length;
        const cellHeight = 26 + (attributeCount + methodCount) * 26;

        // Create the mxCell element for the class
        xml += `
        <mxCell id="${id}" value="${label}" style="${style}" parent="1" vertex="1">
          <mxGeometry x="${x}" y="${y}" width="${width}" height="${cellHeight}" as="geometry"/>
        </mxCell>
`;

        // Start adding attributes and methods after the title bar
        let currentY = 26;

        // Attributes
        classDetail.fields.forEach((field) => {
            const visibility = mapModifierToVisibility(field.modifiers);
            const attributeLabel = `${visibility} ${field.name}: ${field.type}`;
            const attributeId = cellId++;

            xml += `
        <mxCell id="${attributeId}" value="${escapeXml(attributeLabel)}" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;overflow=hidden;rotatable=0;fontSize=12;" parent="${id}" vertex="1">
          <mxGeometry y="${currentY}" width="${width}" height="26" as="geometry"/>
        </mxCell>
`;
            currentY += 26;
        });

        // Methods
        classDetail.methods.forEach((method) => {
            const visibility = mapModifierToVisibility(method.modifiers);
            const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
            const methodLabel = `${visibility} ${method.name}(${params}): ${method.returnType}`;
            const methodId = cellId++;

            xml += `
        <mxCell id="${methodId}" value="${escapeXml(methodLabel)}" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;overflow=hidden;rotatable=0;fontSize=12;" parent="${id}" vertex="1">
          <mxGeometry y="${currentY}" width="${width}" height="26" as="geometry"/>
        </mxCell>
`;
            currentY += 26;
        });

        // Update position for the next class
        x += width + 40;
        if (x > 800) {
            x = 40;
            y += cellHeight + 40; // Adjust y based on the height of the current class cell
        }
    });

    // Generate cells for relationships
    classDetails.forEach((classDetail) => {
        const sourceId = classCellIds[classDetail.className];

        // Inheritance
        if (classDetail.extends && classCellIds[classDetail.extends]) {
            const targetId = classCellIds[classDetail.extends];
            const id = cellId++;

            xml += `
        <mxCell id="${id}" value="" style="endArrow=block;endFill=0;endSize=16;html=1;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeWidth=3;" edge="1" parent="1" source="${sourceId}" target="${targetId}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
`;
        }

        // Implementations (Interfaces)
        if (classDetail.implements) {
            classDetail.implements.forEach((interfaceName) => {
                if (classCellIds[interfaceName]) {
                    const targetId = classCellIds[interfaceName];
                    const id = cellId++;

                    xml += `
        <mxCell id="${id}" value="" style="endArrow=block;endFill=0;endSize=16;dashed=1;html=1;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeWidth=3;" edge="1" parent="1" source="${sourceId}" target="${targetId}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
`;
                }
            });
        }

        // Associations via attributes
        classDetail.fields.forEach((field) => {
            if (classNames.includes(field.type)) {
                const targetId = classCellIds[field.type];
                const id = cellId++;

                // Determine cardinalities
                let sourceCardinality = '1';
                let targetCardinality = '1';
                if (field.isCollection) {
                    targetCardinality = '*';
                }

                xml += `
        <mxCell id="${id}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=12;endArrow=none;endFill=0;strokeWidth=3;" edge="1" parent="1" source="${sourceId}" target="${targetId}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
`;

                // Add labels for association name and cardinalities
                const labelId = cellId++;
                xml += `
        <mxCell id="${labelId}" value="${escapeXml(field.name)}" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=12;" parent="${id}" vertex="1" connectable="0">
          <mxGeometry relative="0.5" as="geometry">
            <mxPoint y="-15" as="offset"/>
          </mxGeometry>
        </mxCell>
`;

                // Source cardinality
                const sourceCardinalityId = cellId++;
                xml += `
        <mxCell id="${sourceCardinalityId}" value="${sourceCardinality}" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=12;" parent="${id}" vertex="1" connectable="0">
          <mxGeometry relative="0" as="geometry">
            <mxPoint x="-20" y="-10" as="offset"/>
          </mxGeometry>
        </mxCell>
`;

                // Target cardinality
                const targetCardinalityId = cellId++;
                xml += `
        <mxCell id="${targetCardinalityId}" value="${targetCardinality}" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=12;" parent="${id}" vertex="1" connectable="0">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="20" y="-10" as="offset"/>
          </mxGeometry>
        </mxCell>
`;
            }
        });
    });

    // Close XML tags
    xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;

    return xml;
}
