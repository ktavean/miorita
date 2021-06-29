import Actions from "~/lib/Actions";
import RunnerFunction from "~/lib/RunnerFunction";

/**
 * Build a regular expression to target action
 *
 * @param action
 * @returns {RegExp}
 */
function regexpForAction (action:string) {
    return new RegExp(
        `(?<![a-z_\\$])${// Not preceded by a letter or any character that may make it a different identifier
            action
        }(?=\\s*\\()` // Succeeded by optional space and a parenthesis
        , "ig",
    );
}

type Replacer = {
    regex: RegExp
    replacer: string | ((substring:string, ...args:any[]) => string)
};

const replacers:Replacer[] = [
    { // Remove block comments
        regex: /\/\*.*?\*\//gms,
        replacer: "",
    },
    { // Remove line comments
        regex: /\/\/.*/g,
        replacer: "",
    },
    { // make new function definitions async
        regex: /(?<!async\s+)function/ig,
        replacer: "async function",
    },
    { // add "await" before new functions
        regex: /(?<!async|function|await)(\s+)([a-z_0-9]+)\(/ig,
        replacer (fullMatch:string, spaces:string, functionName:string) {
            console.log(fullMatch, functionName);

            if ([
                "if",
                "for",
                "while",
                "switch",
            ].includes(functionName)) {
                return fullMatch;
            }

            return `${spaces}await ${functionName}(`;
        },
    },
];

export default function makeRunner (code:string): RunnerFunction {
    let script = code;

    const actions = Actions.GetActions();

    const actionVar = `_${(Math.random() * 1000).toFixed(0)}`;

    actions.forEach((action) => {
        const realAction = `await ${actionVar}.${action}`;

        script = script.replace(regexpForAction(action), realAction);
    });

    replacers.forEach((matchers) => {
        // @ts-ignore
        script = script.replace(matchers.regex, matchers.replacer);
    });

    if (!script.includes("await")) {
        script += "; return Promise.resolve();";
    }

    // @ts-ignore
    // eslint-disable-next-line no-new-func
    return new Function(actionVar, `return Promise.resolve().then(async function(){
    ${script};
    if ('function' === typeof main) main();
    });`);
}
