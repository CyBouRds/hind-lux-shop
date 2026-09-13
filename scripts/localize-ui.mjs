// One-time mechanical JSX refactor: translation at text-rendering boundaries.
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
const babel=createRequire(req.resolve('@vitejs/plugin-react'))('@babel/core');
const files=['src/Storefront.jsx','src/ui.jsx','src/App.jsx','src/admin/Admin.jsx','src/admin/Editors.jsx'];
const attributes=new Set(['label','title','placeholder','aria-label','alt']);
const collected=new Set();
for(const file of files){
  const source=readFileSync(file,'utf8');
  const result=babel.transformSync(source,{configFile:false,babelrc:false,parserOpts:{plugins:['jsx']},plugins:[({types:t})=>({visitor:{
    JSXElement(p){if(p.node.openingElement.name.name!=='option'||p.node.openingElement.attributes.some(a=>a.name?.name==='value'))return;const child=p.node.children.find(c=>c.type==='JSXText'&&c.value.trim()||c.type==='JSXExpressionContainer');if(child)p.node.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier('value'),child.type==='JSXText'?t.stringLiteral(child.value.trim()):t.jsxExpressionContainer(t.cloneNode(child.expression))));},
    JSXText(p){const value=p.node.value.replace(/\s+/g,' ');if(!value.trim())return;collected.add(value.trim());p.replaceWith(t.jsxExpressionContainer(t.callExpression(t.identifier('t'),[t.stringLiteral(value)])));p.skip();},
    JSXAttribute(p){if(attributes.has(p.node.name.name)&&p.node.value?.type==='StringLiteral'){collected.add(p.node.value.value);p.node.value=t.jsxExpressionContainer(t.callExpression(t.identifier('t'),[p.node.value]));p.skip();}},
    JSXExpressionContainer:{exit(p){if(p.parent.type==='JSXAttribute'&&!attributes.has(p.parent.name.name))return;const e=p.node.expression;if(e.type==='JSXEmptyExpression'||e.type==='ArrowFunctionExpression'||e.type==='CallExpression'&&e.callee.name==='t')return;p.node.expression=t.callExpression(t.identifier('t'),[e]);}}
  }})]});
  const relative=file.includes('/admin/')?'../i18n':'./i18n';
  writeFileSync(file,(source.includes("import { t }")?'':`import { t } from '${relative}';\n`)+result.code+'\n');
}
console.log([...collected].sort().join('\n'));
