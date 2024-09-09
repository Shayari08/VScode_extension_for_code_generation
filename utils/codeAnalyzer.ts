import * as ts from 'typescript';

export interface FunctionInfo {
    name: string;
    parameters: string[];
    returnType: string;
    startLine: number;
    endLine: number;
}

export class CodeAnalyzer {
    private sourceFile: ts.SourceFile;

    constructor(private code: string) {
        this.sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
    }

    public analyzeFunctions(): FunctionInfo[] {
        const functionInfos: FunctionInfo[] = [];
        const visit = (node: ts.Node) => {
            if (ts.isFunctionDeclaration(node) && node.name) {
                const functionInfo: FunctionInfo = {
                    name: node.name.getText(),
                    parameters: node.parameters.map(param => param.name.getText()),
                    returnType: node.type ? node.type.getText() : 'void',
                    startLine: this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
                    endLine: this.sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1,
                };
                functionInfos.push(functionInfo);
            }
            ts.forEachChild(node, visit);
        };
        visit(this.sourceFile);
        return functionInfos;
    }
}
