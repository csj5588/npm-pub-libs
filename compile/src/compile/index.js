module.exports = function(schema, option) {
  const { prettier, request } = option;
  // imports
  const imports = [];

  // inline style
  const style = {};

  // Global Public Functions
  const utils = [];

  // Classes 
  const classes = [];

  // 1vw = width / 100
  const _w = (option.responsive.width / 100) || 750;

  // 是不是表达式
  const isExpression = (value) => {
    return /^\{\{.*\}\}$/.test(value);
  }

  // 转字符串
  const toString = (value) => {
    if ({}.toString.call(value) === '[object Function]') {
      return value.toString();
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        } else {
          return value;
        }
      })
    }

    return String(value);
  };

  // flexDirection -> flex-direction
  const parseCamelToLine = (string) => {
    return string.split(/(?=[A-Z])/).join('-').toLowerCase();
  }

  // className structure support
  const generateLess = (schema, style) => {
    let less = `.prefix{`;
    function walk(json, isChilds) {
      if (json.props.className) {
        let className = json.props.className;
        if (!isChilds) {
          less += `&${className} {`;
        } else {
          less += `.${className} {`;
        }

        for (let key in style[className]) {
          // 检测 padding margin
          less += `${parseCamelToLine(key)}: ${style[className][key]};\n`
        }
      }

      if (json.children && json.children.length > 0) {
        json.children.forEach(child => walk(child, true));
      }

      if (json.props.className) {
        less += '}';
      }
    }

    walk(schema);

    less += '}';
    return less;
  };

  // convert to responsive unit, such as vw add px transform
  const parseStyle = (styles, type) => {
    for (let style in styles) {
      for (let key in styles[style]) {
        switch (key) {
          case 'fontSize':
          case 'marginTop':
          case 'marginBottom':
          case 'paddingTop':
          case 'paddingBottom':
          case 'height':
          case 'top':
          case 'bottom':
          case 'width':
          case 'maxWidth':
          case 'left':
          case 'right':
          case 'paddingRight':
          case 'paddingLeft':
          case 'marginLeft':
          case 'marginRight':
          case 'lineHeight':
          case 'borderBottomRightRadius':
          case 'borderBottomLeftRadius':
          case 'borderTopRightRadius':
          case 'borderTopLeftRadius':
          case 'borderRadius':
            if (type === 'vw') {
              styles[style][key] = (parseInt(styles[style][key]) / _w).toFixed(2) + type;
            }
            if (type === 'px') {
              styles[style][key] = parseInt(styles[style][key]) + type;
            }
            break;
        }
      }
    }
    return styles;
  }

  // parse function, return params and content
  const parseFunction = (func) => {
    const funcString = func.toString();
    const params = funcString.match(/\([^\(\)]*\)/)[0].slice(1, -1);
    const content = funcString.slice(funcString.indexOf('{') + 1, funcString.lastIndexOf('}'));
    return {
      params,
      content
    };
  }

  // parse layer props(static values or expression)
  const parseProps = (value, isReactNode) => {
    if (typeof value === 'string') {
      if (isExpression(value)) {
        if (isReactNode) {
          return value.slice(1, -1);
        } else {
          return value.slice(2, -2);
        }
      }

      if (isReactNode) {
        return value;
      } else {
        return `'${value}'`;
      }
    } else if (typeof value === 'function') {
      const {params, content} = parseFunction(value);
      return `(${params}) => {${content}}`;
    }
  }

  // parse async dataSource
  const parseDataSource = (data) => {
    const name = data.id;
    const {uri, method, params} = data.options;
    const action = data.type;
    let payload = {};

    switch (action) {
      case 'fetch':
        if (imports.indexOf(`import {fetch} from fetch`) === -1) {
          imports.push(`import {fetch} from 'fetch'`);
        }
        payload = {
          method: method
        };

        break;
      case 'jsonp':
        if (imports.indexOf(`import {fetchJsonp} from fetch-jsonp`) === -1) {
          imports.push(`import jsonp from 'fetch-jsonp'`);
        }
        break;
    }

    Object.keys(data.options).forEach((key) => {
      if (['uri', 'method', 'params'].indexOf(key) === -1) {
        payload[key] = toString(data.options[key]);
      }
    });

    // params parse should in string template
    if (params) {
      payload = `${toString(payload).slice(0, -1)} ,body: ${isExpression(params) ? parseProps(params) : toString(params)}}`;
    } else {
      payload = toString(payload);
    }

    let result = `{
      ${action}(${parseProps(uri)}, ${toString(payload)})
        .then((response) => response.json())
    `;

    if (data.dataHandler) {
      const { params, content } = parseFunction(data.dataHandler);
      result += `.then((${params}) => {${content}})
        .catch((e) => {
          console.log('error', e);
        })
      `
    }

    result += '}\n';

    return `${name} = () => ${result}`;
  }

  // parse condition: whether render the layer
  const parseCondition = (condition, render) => {
    if (typeof condition === 'boolean') {
      return `${condition} && ${render}`
    } else if (typeof condition === 'string') {
      return `${condition.slice(2, -2)} && ${render}`
    }
  }

  // parse loop render
  const parseLoop = (loop, loopArg, render) => {
    let data;
    let loopArgItem = (loopArg && loopArg[0]) || 'item';
    let loopArgIndex = (loopArg && loopArg[1]) || 'index';

    if (Array.isArray(loop)) {
      data = toString(loop);
    } else if (isExpression(loop)) {
      data = loop.slice(2, -2);
    }

    // add loop key
    const tagEnd = render.match(/^<.+?\s/)[0].length;
    render = `${render.slice(0, tagEnd)} key={${loopArgIndex}}${render.slice(tagEnd)}`;

    // remove `this` 
    const re = new RegExp(`this.${loopArgItem}`, 'g')
    render = render.replace(re, loopArgItem);

    return `${data}.map((${loopArgItem}, ${loopArgIndex}) => {
      return (${render});
    })`;
  }

  fileProcess = (fileUrl) => {
    const u8arr = new Uint8Array()
  }

  // generate render xml
  const generateRender = (schema, isChilds) => {
    const type = schema.componentName.toLowerCase();
    const className = schema.props && schema.props.className;
    let classString = className ? ` className="${className}"` : '';
    if (!isChilds) {
      classString = className ? ` className={cx('${className}')}` : '';
    }

    if (className) {
      style[className] = schema.props.style;
    }

    let xml;
    let props = '';

    Object.keys(schema.props).forEach((key) => {
      if (['className', 'style', 'text', 'src'].indexOf(key) === -1) {
        props += ` ${key}={${parseProps(schema.props[key])}}`;
      }
    })

    switch(type) {
      case 'text':
        const innerText = parseProps(schema.props.text, true);
        xml = `<span${classString}${props}>${innerText}</span>`;
        break;
      case 'image':
        const source = parseProps(schema.props.src);
        xml = `<img${classString}${props} src={${source}} />`;
        fileProcess(source)
        break;
      case 'div':
      case 'page':
      case 'block':
      case 'component':
        if (schema.children && schema.children.length) {
          xml = `<div${classString}${props}>${transform(schema.children, true)}</div>`;
        } else {
          xml = `<div${classString}${props} />`;
        }
        break;
    }

    if (schema.loop) {
      xml = parseLoop(schema.loop, schema.loopArgs, xml)
    }
    if (schema.condition) {
      xml = parseCondition(schema.condition, xml);
    }
    if (schema.loop || schema.condition) {
      xml = `{${xml}}`;
    }

    return xml;
  }

  // parse schema
  const transform = (schema, isChilds) => {
    let result = '';
    if (Array.isArray(schema)) {
      schema.forEach((layer) => {
        result += transform(layer, isChilds);
      });
    } else {
      const type = schema.componentName.toLowerCase();
      // , 'block', 'component'
      if (['page'].indexOf(type) !== -1) {
        // 容器组件处理: state/method/dataSource/lifeCycle/render
        const states = [];
        const lifeCycles = [];
        const methods = [];
        const init = [];
        const render = [`render(){ return (`];
        let classData = [`class ${schema.componentName}_0 extends React.Component {`];

        if (schema.state) {
          states.push(`state = ${toString(schema.state)}\n`);
        }

        if (schema.methods) {
          Object.keys(schema.methods).forEach((name) => {
            const { params, content } = parseFunction(schema.methods[name]);
            methods.push(`${name} = (${params}) => { ${content} }\n`);
          });
        }

        if (schema.dataSource && Array.isArray(schema.dataSource.list)) {
          schema.dataSource.list.forEach((item) => {
            if (typeof item.isInit === 'boolean' && item.isInit) {
              init.push(`this.${item.id}();`)
            } else if (typeof item.isInit === 'string') {
              init.push(`if (${parseProps(item.isInit)}) { this.${item.id}(); }`)
            }
            methods.push(parseDataSource(item));
          });

          if (schema.dataSource.dataHandler) {
            const { params, content } = parseFunction(schema.dataSource.dataHandler);
            methods.push(`dataHandler = (${params}) => {${content}}\n`);
            init.push(`this.dataHandler()`);
          }
        }

        if (schema.lifeCycles) {
          if (!schema.lifeCycles['_constructor']) {
            lifeCycles.push(`constructor(props, context) { super(); }\n`);
            lifeCycles.push(`componentDidMount() { ${init.join('\n')}}\n`);
          }

          Object.keys(schema.lifeCycles).forEach((name) => {
            const { params, content } = parseFunction(schema.lifeCycles[name]);

            if (name === '_constructor') {
              lifeCycles.push(`constructor(${params}) { super(); ${content} }\n`);
              lifeCycles.push(`componentDidMount() { ${init.join('\n')}}\n`);
            } else {
              lifeCycles.push(`${name}(${params}) {${content}}\n`);
            }
          });
        }

        render.push(generateRender(schema, isChilds))
        render.push(`);}`);

        classData = classData.concat(states).concat(lifeCycles).concat(methods).concat(render);
        classData.push('}');

        classes.push(classData.join('\n'));
      } else {
        result += generateRender(schema, isChilds);
      }
    }

    return result;
  };

  // less 转 防污染
  const compileLessPanel = (schema, style) => {
    const head = `@prefix: ${schema.componentName}_0;\n\n`;
    let panel = prettier.format(generateLess(schema, style), { parser: 'less', tabWidth: 2 })
    const decoratePanel = head + panel.replace('prefix', '@{prefix}-');
    return decoratePanel
  }

  if (option.utils) {
    Object.keys(option.utils).forEach((name) => {
      utils.push(`const ${name} = ${option.utils[name]}`);
    });
  }

  // start parse schema
  transform(schema);

  const prettierOpt = {
    parser: 'babel',
    printWidth: 120,
    singleQuote: true
  };
  
  return {
    panelDisplay: [
      {
        panelName: `index.jsx`,
        panelValue: prettier.format(`
          /* eslint-disable */

          import React from 'react';
          import utils from '@inke-design/utils';
          ${imports.join('\n')}
          import styles from './style.less';

          const cx = utils.classnames('${schema.componentName}_0', styles);

          ${utils.join('\n')}
          ${classes.join('\n')}
          export default ${schema.componentName}_0;
        `, prettierOpt),
        panelType: 'js',
      },
      {
        panelName: `style.px.less`,
        // panelValue: compileLessPanel(schema, style),
        panelValue: compileLessPanel(schema, parseStyle(style, 'px')),
        panelType: 'less'
      },
      {
        panelName: `style.less`,
        // panelValue: compileLessPanel(schema, style),
        panelValue: compileLessPanel(schema, parseStyle(style, 'vw')),
        panelType: 'less'
      },
    ],
    noTemplate: true
  };
}
