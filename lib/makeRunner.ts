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

const replacers = [
    {
        regex: /(?<!async\s+)function/ig,
        replacer: "async function",
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
        script = script.replace(matchers.regex, matchers.replacer);
    });

    if (!script.includes("await")) {
        script += "; return Promise.resolve();";
    }

    // @ts-ignore
    // eslint-disable-next-line no-new-func
    return new Function(actionVar, `return Promise.resolve().then(async function(){${script}});`);
}
