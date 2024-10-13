# jdraw

**jdraw** is a VSCode extension that allows you to convert Java code into UML diagrams and generate UML diagrams from modeling languages or code. This extension uses Draw.io Integration to visualize UML diagrams within VSCode.

## Features

- **Java to UML**: Convert Java code into UML diagrams.
- **Java to Modeling Language**: Generate an intermediate modeling language from Java code for database modeling or other systems.
- **Modeling Language to UML**: Convert a modeling language into UML diagrams.
- **UML to Java**: Generate Java code from a UML diagram.

## Prerequisites

- **VSCode** (version 1.94.0 or higher)
- **Draw.io Integration Extension** (to display UML diagrams)
  - Note: The extension does not require PlantUML unless you wish to generate and view PlantUML files.

## Installation

Clone the project to your local directory:

```bash
git clone https://github.com/your-username/jdraw.git
```

Navigate to the project directory:

```bash
cd jdraw
```

Install the dependencies:

```bash
npm install
```

## Usage

1. Open the project in VSCode.
2. Launch the extension in development mode:
   - Press **F5** to open a new VSCode window with the extension loaded.
3. Open a Java file that you want to convert.
4. Run the desired command:
   - Press **Ctrl+Shift+P** (or **Cmd+Shift+P** on Mac) to open the command palette.
   - Type "**JDraw: Convert Java to UML**" to generate an organized display and UML code.
   - Type "**JDraw: Convert Java to Modeling Language**" to generate the intermediate modeling language output.
5. View the results:
   - The output will appear in the debug console.
   - Optionally, you can configure the extension to save the output to a file or display it in a dedicated view.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss changes or improvements.

## License

This project is licensed under the MIT License.