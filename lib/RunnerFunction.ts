import Actions from "~/lib/Actions";

type RunnerFunction = (_action: Actions) => Promise<any>;
export default RunnerFunction;
