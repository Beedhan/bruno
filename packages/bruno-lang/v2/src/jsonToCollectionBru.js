const _ = require('lodash');

const { indentString } = require('../../v1/src/utils');

const enabled = (items = []) => items.filter((item) => item.enabled);
const disabled = (items = []) => items.filter((item) => !item.enabled);

// remove the last line if two new lines are found
const stripLastLine = (text) => {
  if (!text || !text.length) return text;

  return text.replace(/(\r?\n)$/, '');
};

const jsonToBru = (json) => {
  const { meta, query, headers, auth, script, tests, vars, docs } = json;

  let bru = '';

  if (meta) {
    bru += 'meta {\n';
    for (const key in meta) {
      bru += `  ${key}: ${meta[key]}\n`;
    }
    bru += '}\n\n';
  }

  if (query && query.length) {
    bru += 'query {';
    if (enabled(query).length) {
      bru += `\n${indentString(
        enabled(query)
          .map((item) => `${item.name}: ${item.value}`)
          .join('\n')
      )}`;
    }

    if (disabled(query).length) {
      bru += `\n${indentString(
        disabled(query)
          .map((item) => `~${item.name}: ${item.value}`)
          .join('\n')
      )}`;
    }

    bru += '\n}\n\n';
  }

  if (headers && headers.length) {
    bru += 'headers {';
    if (enabled(headers).length) {
      bru += `\n${indentString(
        enabled(headers)
          .map((item) => `${item.name}: ${item.value}`)
          .join('\n')
      )}`;
    }

    if (disabled(headers).length) {
      bru += `\n${indentString(
        disabled(headers)
          .map((item) => `~${item.name}: ${item.value}`)
          .join('\n')
      )}`;
    }

    bru += '\n}\n\n';
  }

  if (auth && auth.mode) {
    bru += `auth {
${indentString(`mode: ${auth.mode}`)}
}

`;
  }

  if (auth && auth.basic) {
    bru += `auth:basic {
${indentString(`username: ${auth.basic.username}`)}
${indentString(`password: ${auth.basic.password}`)}
}

`;
  }

  if (auth && auth.bearer) {
    bru += `auth:bearer {
${indentString(`token: ${auth.bearer.token}`)}
}

`;
  }

  let reqvars = _.get(vars, 'req');
  let resvars = _.get(vars, 'res');
  if (reqvars && reqvars.length) {
    const varsEnabled = _.filter(reqvars, (v) => v.enabled && !v.local);
    const varsDisabled = _.filter(reqvars, (v) => !v.enabled && !v.local);
    const varsLocalEnabled = _.filter(reqvars, (v) => v.enabled && v.local);
    const varsLocalDisabled = _.filter(reqvars, (v) => !v.enabled && v.local);

    bru += `vars:pre-request {`;

    if (varsEnabled.length) {
      bru += `\n${indentString(varsEnabled.map((item) => `${item.name}: ${item.value}`).join('\n'))}`;
    }

    if (varsLocalEnabled.length) {
      bru += `\n${indentString(varsLocalEnabled.map((item) => `@${item.name}: ${item.value}`).join('\n'))}`;
    }

    if (varsDisabled.length) {
      bru += `\n${indentString(varsDisabled.map((item) => `~${item.name}: ${item.value}`).join('\n'))}`;
    }

    if (varsLocalDisabled.length) {
      bru += `\n${indentString(varsLocalDisabled.map((item) => `~@${item.name}: ${item.value}`).join('\n'))}`;
    }

    bru += '\n}\n\n';
  }
  if (resvars && resvars.length) {
    const varsEnabled = _.filter(resvars, (v) => v.enabled && !v.local);
    const varsDisabled = _.filter(resvars, (v) => !v.enabled && !v.local);
    const varsLocalEnabled = _.filter(resvars, (v) => v.enabled && v.local);
    const varsLocalDisabled = _.filter(resvars, (v) => !v.enabled && v.local);

    bru += `vars:post-response {`;

    if (varsEnabled.length) {
      bru += `\n${indentString(varsEnabled.map((item) => `${item.name}: ${item.value}`).join('\n'))}`;
    }

    if (varsLocalEnabled.length) {
      bru += `\n${indentString(varsLocalEnabled.map((item) => `@${item.name}: ${item.value}`).join('\n'))}`;
    }

    if (varsDisabled.length) {
      bru += `\n${indentString(varsDisabled.map((item) => `~${item.name}: ${item.value}`).join('\n'))}`;
    }

    if (varsLocalDisabled.length) {
      bru += `\n${indentString(varsLocalDisabled.map((item) => `~@${item.name}: ${item.value}`).join('\n'))}`;
    }

    bru += '\n}\n\n';
  }

  if (script && script.req && script.req.length) {
    bru += `script:pre-request {
${indentString(script.req)}
}

`;
  }

  if (script && script.res && script.res.length) {
    bru += `script:post-response {
${indentString(script.res)}
}

`;
  }

  if (tests && tests.length) {
    bru += `tests {
${indentString(tests)}
}

`;
  }

  if (docs && docs.length) {
    bru += `docs {
${indentString(docs)}
}

`;
  }

  return stripLastLine(bru);
};

module.exports = jsonToBru;
