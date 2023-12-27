const userReducer = (
  state: string = "",
  action: { type: string; payload: string }
) => {
  switch (action.type) {
    case "SETNAME":
      return action.payload;
    default:
      return state;
  }
};
export default userReducer;
