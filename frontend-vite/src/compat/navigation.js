import {
  useNavigate,
  useParams as useReactParams,
  useLocation,
  useSearchParams as useReactSearchParams
} from "react-router-dom";
function useRouter() {
  const navigate = useNavigate();
  return {
    push: (url) => navigate(url),
    replace: (url) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: async (_url) => {
    }
  };
}
function usePathname() {
  return useLocation().pathname;
}
function useSearchParams() {
  const [params] = useReactSearchParams();
  return params;
}
function useParams() {
  return useReactParams();
}
function redirect(url) {
  window.location.replace(url);
  throw new Error("Redirecting");
}
function notFound() {
  throw new Error("Page not found");
}
export {
  notFound,
  redirect,
  useParams,
  usePathname,
  useRouter,
  useSearchParams
};
