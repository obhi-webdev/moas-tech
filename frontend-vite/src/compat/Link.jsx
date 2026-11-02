import { Link as RouterLink } from "react-router-dom";
function Link({ href, ...props }) {
  return <RouterLink to={href} {...props} />;
}
export {
  Link as default
};
