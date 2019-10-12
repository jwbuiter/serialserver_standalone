import React from "react";

function get(object, address) {
  address = address.replace(/^\.+/, "");
  const parts = address.split(/[.[]/);

  if (parts.length === 1) {
    return object[parts[0]];
  } else if (address[0] === "[") {
    const index = address.match(/\[[0-9]+\]/)[0].slice(1, -1);
    const newAddress = address.slice(index.length + 2);

    if (!newAddress) return object[Number(index)];

    return get(object[Number(index)], newAddress);
  } else {
    const newAddress = address.slice(parts[0].length);
    return get(object[parts[0]], newAddress);
  }
}

function set(object, address, newValue) {
  address = address.replace(/^\.+/, "");
  const parts = address.split(/[.[]/);

  if (parts.length === 1) {
    object[parts[0]] = newValue;
  } else if (address[0] === "[") {
    const index = address.match(/\[[0-9]+\]/)[0].slice(1, -1);
    const newAddress = address.slice(index.length + 2);

    if (!newAddress) {
      object[Number(index)] = newValue;
    } else {
      set(object[Number(index)], newAddress, newValue);
    }
  } else {
    const newAddress = address.slice(parts[0].length);
    set(object[parts[0]], newAddress, newValue);
  }
}

function makeForm(value, config, changeConfig, index, name = "") {
  if (typeof value.type === "undefined" || typeof value.type === "object") {
    if (Array.isArray(value)) {
      if (value.length === 1) {
        return (
          index >= 0 && (
            <div name={name}>
              {Object.keys(value[0]).map(key =>
                makeForm(value[0][key], config, changeConfig, index, name + "[" + index + "]." + key)
              )}
            </div>
          )
        );
      } else {
        return value.map((element, index) => {
          return makeForm(element, config, changeConfig, index, name + "[" + index + "]");
        });
      }
    } else {
      return (
        <div key={name} name={name}>
          {Object.keys(value)
            .filter(key => {
              const { conditions } = value[key];
              if (!conditions) return true;

              return true;
            })
            .map(key => makeForm(value[key], config, changeConfig, index, name + (name ? "." : "") + key))}
        </div>
      );
    }
  } else {
    if (value.condition && !value.condition(config, index)) return;

    switch (value.type) {
      case "title": {
        return <h3 key={value.name}>{value.name}</h3>;
      }
      case "subtitle": {
        return (
          <>
            <b key={value.name}>{value.name}</b>
            <br />
          </>
        );
      }
      case "emphasis": {
        const oldName = name.replace(/\.\w+$/, "");
        return (
          <div className="configuration--emphasis">
            {makeForm(value.contents, config, changeConfig, index, oldName)}
          </div>
        );
      }
      case "conditional": {
        const oldName = name.replace(/\.\w+$/, "");
        return makeForm(value.contents, config, changeConfig, index, oldName);
      }
      case "external": {
        return makeForm(value.configuration, config, changeConfig, index, value.location);
      }
      case "structArray": {
        const contents = get(config, name) || [];
        const structure = value.structure;
        const defaultStruct = value.defaults;
        return (
          <>
            {value.name}:
            <br />
            {contents.map((element, index) => (
              <div className="configuration--struct">
                #{index + 3}
                <input
                  type="button"
                  value="x"
                  onClick={() => {
                    contents.splice(index, 1);
                    changeConfig(name, contents);
                  }}
                />
                {makeForm(structure, config, changeConfig, index, name + "[" + index + "]")}
              </div>
            ))}
            <input
              type="button"
              value="+"
              onClick={() => {
                changeConfig(name, contents.concat(defaultStruct));
              }}
            />
          </>
        );
      }
      case "keyValue": {
        const options = get(config, name) || [];

        const keyOptions = value.options;
        return (
          <>
            {value.name}:
            <br />
            {options.map((option, index) => (
              <>
                <input
                  type="button"
                  value="x"
                  onClick={() => {
                    options.splice(index, 1);
                    changeConfig(name, options);
                  }}
                />
                <input
                  type="text"
                  onChange={e => {
                    changeConfig(`${name}[${index}].value`, e.target.value);
                  }}
                  value={option.value}
                />
                {keyOptions ? (
                  <select
                    value={option.key}
                    onChange={e => {
                      changeConfig(`${name}[${index}].key`, e.target.value);
                    }}
                  >
                    {Object.entries(keyOptions)
                      .concat([["", ""]])
                      .map(entry => (
                        <option value={entry[0]}>{entry[1]}</option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    onChange={e => {
                      changeConfig(`${name}[${index}].key`, e.target.value, {
                        numeric: true
                      });
                    }}
                    value={option.key}
                  />
                )}

                <br />
              </>
            ))}
            <input
              type="button"
              value="+"
              onClick={() => {
                changeConfig(name, options.concat({ key: "", value: "" }));
              }}
            />
            <br />
          </>
        );
      }
      case "button": {
        return (
          <>
            <input type="button" value={value.name} className="configuration--button" onClick={value.onClick} />
            <br />
          </>
        );
      }
      case "select": {
        return (
          <>
            {value.name}:
            <select
              value={get(config, name)}
              onChange={event => {
                changeConfig(name, event.target.value, {
                  numeric: value.numeric
                });
              }}
            >
              {Object.entries(value.options).map((entry, index) => (
                <option key={index} value={entry[0]}>
                  {entry[1]}
                </option>
              ))}
            </select>
            <br />
          </>
        );
      }
      default: {
        return (
          <>
            {value.name}:
            <input
              type={value.type}
              min={value.min}
              max={value.max}
              step={value.step}
              checked={get(config, name)}
              value={value.rounding ? round(get(config, name), value.rounding) : get(config, name)}
              onChange={event => {
                if (event.target.type === "checkbox") {
                  changeConfig(name, event.target.checked);
                } else {
                  changeConfig(name, event.target.value, {
                    numeric: value.type === "number"
                  });
                }
              }}
            />
            <br />
          </>
        );
      }
    }
  }
}

function round(num, digits) {
  const factor = Math.pow(10, digits);
  return Math.round(num * factor) / factor;
}

const getColumnWidth = (rows, accessor) => {
  const maxWidth = 400;
  const minWidth = 50;
  const magicSpacing = 11;
  const cellLength = Math.max(...rows.map(row => (`${get(row, accessor)}` || "").length));

  return Math.max(minWidth, Math.min(maxWidth, cellLength * magicSpacing));
};

const daysToDate = days => {
  return new Date((days - (25567 + 2)) * 86400 * 1000);
};

export { get, set, makeForm, getColumnWidth, daysToDate };
