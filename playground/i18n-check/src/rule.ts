import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/types';
import { Rule } from 'eslint';

function isAsciiString(text: string) {
  let isAscii = true;
  if (text && !text.match(/^[\x00-\x7F]+$/g)) {
    isAscii = false;
  }
  return isAscii;
}

const tFunctions = new Set<string>(['t']);
const tAttributes = new Set<string>([]);
const tComponents = new Set<string>([]);
const rule = (): Rule.RuleModule => {
  return {
    // preferred location of name and version
    meta: {
      type: 'problem',
      docs: {
        description: 'i18n check',
      },
      schema: [],
    },
    create(context: any) {
      return {
        TemplateElement(node: TSESTree.TemplateElement) {
          const value = node.value.raw;
          if (!isAsciiString(value)) {
            context.report({
              node,
              message: `i18n check: '${value}'`,
            });
          }
        },
        Literal(node: TSESTree.Literal) {
          if (typeof node.value === 'string') {
            const { value } = node;
            if (
              node.parent.type === AST_NODE_TYPES.CallExpression &&
              node.parent.callee.type === AST_NODE_TYPES.Identifier &&
              tFunctions.has(node.parent.callee.name)
            ) {
              return;
            }
            if (
              node.parent.type === AST_NODE_TYPES.JSXAttribute &&
              node.parent.name.type === AST_NODE_TYPES.JSXIdentifier &&
              tAttributes.has(node.parent.name.name) &&
              node.parent.parent.type === AST_NODE_TYPES.JSXOpeningElement &&
              node.parent.parent.name.type === AST_NODE_TYPES.JSXIdentifier &&
              tComponents.has(node.parent.parent.name.name)
            ) {
              return;
            }
            if (!isAsciiString(value)) {
              context.report({
                node,
                message: `i18n check: '${value}'`,
              });
            }
          }
        },
      } as any;
    },
  };
};

export default rule;
