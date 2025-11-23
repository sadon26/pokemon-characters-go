import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useNavigate, useLocation, useParams } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useCallback, createContext, useContext, Suspense, useEffect, useRef } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import ReactPaginate from "react-paginate";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2/",
  timeout: 1e4,
  // 10 seconds
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use(
  (config) => {
    console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest._retry && error.code === "ECONNABORTED") {
      originalRequest._retry = true;
      console.warn("⏳ Retrying request...");
      return api(originalRequest);
    }
    console.error("❌ API Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);
const getPokemons = (url, params) => api.get(url, {
  params: {
    ...params,
    q: "bulbasaur"
  }
});
const getPokemon = (url, params) => api.get(url, { params });
const useAxios = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState(false);
  const fetchData = async (apiCall) => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiCall();
      setData(res.data);
      return Promise.resolve(res.data);
    } catch (error2) {
      setError(true);
      console.error("Error fetching data:", error2);
      throw error2;
    } finally {
      setLoading(false);
    }
  };
  const API = {
    getPokemons: async (params) => await fetchData(
      () => getPokemons("pokemon", params)
    ),
    getPokemon: async (id, params) => await fetchData(
      () => getPokemon(`pokemon/${id}`, params)
    )
  };
  return {
    API,
    loading,
    error,
    data
  };
};
const initialValue = {
  view: "grid",
  caughtPokemons: [],
  pageLoaded: false
};
const localKeys = Object.keys(
  initialValue
).reduce((acc, curr) => ({ ...acc, [curr]: curr }), {});
const useLocalStore = () => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem("global");
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${"global"}":`, error);
      return initialValue;
    }
  });
  const setValue = (key, value) => {
    try {
      if (typeof window !== "undefined") {
        setStoredValue((prevData) => {
          const newData = { ...prevData, [localKeys[key]]: value };
          window.localStorage.setItem("global", JSON.stringify(newData));
          return newData;
        });
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  return [storedValue, setValue];
};
const useUpdatePokemons = () => {
  const [store, setStore] = useLocalStoreContext();
  const hasCaughtPokemon = (pokemon) => !!store?.caughtPokemons?.find((p) => p.name === pokemon?.name);
  const catchPokemon = useCallback(
    (pokemon) => {
      const foundPokemon = store?.caughtPokemons?.find(
        (p) => p.name === pokemon.name
      );
      if (foundPokemon) {
        alert(`${pokemon.name} already added!`);
        return;
      }
      const caughtPokemons = [...store?.caughtPokemons ?? []];
      caughtPokemons.splice(caughtPokemons.length, 0, {
        ...pokemon,
        timestamp: `${(/* @__PURE__ */ new Date()).toLocaleDateString()}, ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`
      });
      setStore(localKeys.caughtPokemons, [...caughtPokemons]);
    },
    [store?.caughtPokemons]
  );
  const removePokemon = useCallback(
    (pokemon) => {
      const foundPokemonIndex = store?.caughtPokemons?.findIndex(
        (p) => p.name === pokemon.name
      );
      const caughtPokemons = [...store?.caughtPokemons ?? []];
      caughtPokemons.splice(foundPokemonIndex, 1);
      setStore(localKeys.caughtPokemons, caughtPokemons);
    },
    [store?.caughtPokemons]
  );
  return {
    catchPokemon,
    removePokemon,
    hasCaughtPokemon
  };
};
const useExportCSV = () => {
  const exportAsCSV = ({
    pokemons,
    link
  }) => {
    const rows = [...pokemons ?? []];
    if (!rows.length) {
      alert("Catch your Pokémons to export");
      return;
    }
    const headers = [
      "id",
      "name",
      "types",
      "height",
      "weight",
      "timestamp"
    ];
    const csv = [headers.join(",")].concat(
      rows.map(
        (r) => headers.map((h) => {
          const v = (r[h] ?? "").toString().replace(/"/g, '""');
          return `"${v}"`;
        }).join(",")
      )
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${link}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return { exportAsCSV };
};
const LocalStoreContext = createContext([
  {
    view: "grid"
  },
  () => {
  }
]);
const LocalStore = ({ children }) => {
  const [store, setStore] = useLocalStore();
  return /* @__PURE__ */ jsx(LocalStoreContext.Provider, { value: [store, setStore], children });
};
const useLocalStoreContext = () => useContext(LocalStoreContext);
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Suspense, {
    fallback: /* @__PURE__ */ jsx(Fragment, {
      children: "Loading..."
    }),
    children: /* @__PURE__ */ jsx(LocalStore, {
      children: /* @__PURE__ */ jsx(Outlet, {})
    })
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const PokemonLogo = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='iso-8859-1'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20height='800px'%20width='800px'%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%20511.985%20511.985'%20xml:space='preserve'%3e%3cpath%20style='fill:%23ED5564;'%20d='M491.859,156.348c-12.891-30.483-31.342-57.865-54.842-81.372%20c-23.516-23.5-50.904-41.96-81.373-54.85c-31.56-13.351-65.091-20.125-99.652-20.125c-34.554,0-68.083,6.773-99.645,20.125%20c-30.483,12.89-57.865,31.351-81.373,54.85c-23.499,23.507-41.959,50.889-54.85,81.372C6.774,187.91,0,221.44,0,255.993%20c0,34.56,6.773,68.091,20.125,99.652c12.89,30.469,31.351,57.857,54.85,81.357c23.507,23.516,50.889,41.967,81.373,54.857%20c31.562,13.344,65.091,20.125,99.645,20.125c34.561,0,68.092-6.781,99.652-20.125c30.469-12.891,57.857-31.342,81.373-54.857%20c23.5-23.5,41.951-50.889,54.842-81.357c13.344-31.561,20.125-65.092,20.125-99.652C511.984,221.44,505.203,187.91,491.859,156.348z%20'/%3e%3cpath%20style='fill:%23E6E9ED;'%20d='M0.102,263.18c0.875,32.014,7.593,63.092,20.023,92.465c12.89,30.469,31.351,57.857,54.85,81.357%20c23.507,23.516,50.889,41.967,81.373,54.857c31.562,13.344,65.091,20.125,99.645,20.125c34.561,0,68.092-6.781,99.652-20.125%20c30.469-12.891,57.857-31.342,81.373-54.857c23.5-23.5,41.951-50.889,54.842-81.357c12.438-29.373,19.156-60.451,20.031-92.465%20H0.102z'/%3e%3cpath%20style='fill:%23434A54;'%20d='M510.765,281.211c0.812-8.344,1.219-16.75,1.219-25.218c0-9.516-0.516-18.953-1.531-28.289%20c-12.719,1.961-30.984,4.516-53.998,7.054c-43.688,4.82-113.904,10.57-200.463,10.57c-86.552,0-156.776-5.75-200.455-10.57%20c-23.022-2.539-41.28-5.093-53.998-7.054C0.516,237.04,0,246.478,0,255.993c0,8.468,0.406,16.875,1.219,25.218%20c41.53,6.25,133.027,17.436,254.773,17.436S469.234,287.461,510.765,281.211z'/%3e%3cpath%20style='fill:%23E6E9ED;'%20d='M309.334,266.656c0,29.459-23.891,53.334-53.342,53.334c-29.452,0-53.334-23.875-53.334-53.334%20c0-29.453,23.882-53.327,53.334-53.327C285.443,213.33,309.334,237.204,309.334,266.656z'/%3e%3cpath%20style='fill:%23434A54;'%20d='M255.992,170.66c-52.936,0-95.997,43.069-95.997,95.997s43.062,95.988,95.997,95.988%20s95.996-43.061,95.996-95.988C351.988,213.729,308.928,170.66,255.992,170.66z%20M255.992,309.335%20c-23.522,0-42.663-19.156-42.663-42.678c0-23.523,19.14-42.663,42.663-42.663c23.531,0,42.654,19.14,42.654,42.663%20C298.646,290.178,279.523,309.335,255.992,309.335z'/%3e%3cpath%20style='opacity:0.2;fill:%23FFFFFF;enable-background:new%20;'%20d='M491.859,156.348c-12.891-30.483-31.342-57.865-54.842-81.372%20c-23.516-23.5-50.904-41.96-81.373-54.85c-31.56-13.351-65.091-20.125-99.652-20.125c-3.57,0-7.125,0.078-10.664,0.219%20c30.789,1.25,60.662,7.93,88.974,19.906c30.498,12.89,57.873,31.351,81.371,54.85c23.5,23.507,41.969,50.889,54.857,81.372%20c13.359,31.562,20.109,65.092,20.109,99.646c0,34.56-6.75,68.091-20.109,99.652c-12.889,30.469-31.357,57.857-54.857,81.357%20c-23.498,23.516-50.873,41.967-81.371,54.857c-28.312,11.969-58.186,18.656-88.974,19.906c3.539,0.141,7.093,0.219,10.664,0.219%20c34.561,0,68.092-6.781,99.652-20.125c30.469-12.891,57.857-31.342,81.373-54.857c23.5-23.5,41.951-50.889,54.842-81.357%20c13.344-31.561,20.125-65.092,20.125-99.652C511.984,221.44,505.203,187.91,491.859,156.348z'/%3e%3cpath%20style='opacity:0.1;enable-background:new%20;'%20d='M20.125,355.645c12.89,30.469,31.351,57.857,54.85,81.357%20c23.507,23.516,50.889,41.967,81.373,54.857c31.562,13.344,65.091,20.125,99.645,20.125c3.57,0,7.125-0.078,10.664-0.219%20c-30.789-1.25-60.67-7.938-88.982-19.906c-30.483-12.891-57.857-31.342-81.364-54.857c-23.507-23.5-41.96-50.889-54.858-81.357%20c-13.352-31.56-20.117-65.091-20.117-99.652c0-34.554,6.765-68.084,20.116-99.646C54.35,125.864,72.803,98.481,96.31,74.983%20c23.507-23.507,50.881-41.968,81.364-54.858c28.312-11.976,58.193-18.656,88.982-19.906c-3.539-0.14-7.094-0.218-10.664-0.218%20c-34.554,0-68.083,6.773-99.645,20.125c-30.483,12.89-57.865,31.351-81.373,54.858c-23.499,23.499-41.959,50.881-54.85,81.364%20C6.774,187.91,0,221.44,0,255.993C0,290.553,6.774,324.085,20.125,355.645z'/%3e%3c/svg%3e";
const RippleLoader = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='xMidYMid'%20width='200'%20height='200'%20style='shape-rendering:%20auto;%20display:%20block;%20background:%20rgb(255,%20255,%20255);'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cg%3e%3ccircle%20stroke-width='2'%20stroke='%23e90c59'%20fill='none'%20r='0'%20cy='50'%20cx='50'%3e%3canimate%20begin='0s'%20calcMode='spline'%20keySplines='0%200.2%200.8%201'%20keyTimes='0;1'%20values='0;40'%20dur='1s'%20repeatCount='indefinite'%20attributeName='r'%3e%3c/animate%3e%3canimate%20begin='0s'%20calcMode='spline'%20keySplines='0.2%200%200.8%201'%20keyTimes='0;1'%20values='1;0'%20dur='1s'%20repeatCount='indefinite'%20attributeName='opacity'%3e%3c/animate%3e%3c/circle%3e%3ccircle%20stroke-width='2'%20stroke='%2346dff0'%20fill='none'%20r='0'%20cy='50'%20cx='50'%3e%3canimate%20begin='-0.5s'%20calcMode='spline'%20keySplines='0%200.2%200.8%201'%20keyTimes='0;1'%20values='0;40'%20dur='1s'%20repeatCount='indefinite'%20attributeName='r'%3e%3c/animate%3e%3canimate%20begin='-0.5s'%20calcMode='spline'%20keySplines='0.2%200%200.8%201'%20keyTimes='0;1'%20values='1;0'%20dur='1s'%20repeatCount='indefinite'%20attributeName='opacity'%3e%3c/animate%3e%3c/circle%3e%3cg%3e%3c/g%3e%3c/g%3e%3c!--%20[ldio]%20generated%20by%20https://loading.io%20--%3e%3c/svg%3e";
const TickIcon = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%201024%201024'%20class='icon'%20version='1.1'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M511.891456%20928.549888c229.548032%200%20415.634432-186.0864%20415.634432-415.634432C927.525888%20283.3664%20741.439488%2097.28%20511.890432%2097.28%20282.343424%2097.28%2096.258048%20283.3664%2096.258048%20512.915456c0%20229.548032%20186.084352%20415.634432%20415.634432%20415.634432'%20fill='%23FFF200'%20/%3e%3cpath%20d='M436.571136%20707.376128l330.3936-330.3936c5.506048-5.507072%208.571904-12.803072%208.633344-20.544512%200.060416-7.85408-2.961408-15.235072-8.511488-20.784128%200.001024-0.012288-0.001024-0.002048-0.001024-0.002048l-0.001024-0.001024c-5.410816-5.409792-12.978176-8.489984-20.687872-8.460288-7.810048%200.032768-15.13984%203.081216-20.640768%208.58112l-309.11488%20309.116928-94.99648-94.998528c-5.501952-5.501952-12.833792-8.5504-20.642816-8.58112h-0.115712c-7.69536%200-15.186944%203.08224-20.569088%208.465408-11.360256%2011.36128-11.307008%2029.899776%200.118784%2041.325568l109.924352%20109.924352a29.017088%2029.017088%200%200%200%204.883456%206.474752c5.658624%205.6576%2013.095936%208.482816%2020.550656%208.481792a29.31712%2029.31712%200%200%200%2020.77696-8.604672M511.891456%2097.28C282.3424%2097.28%2096.256%20283.3664%2096.256%20512.915456s186.0864%20415.634432%20415.635456%20415.634432c229.548032%200%20415.634432-186.085376%20415.634432-415.634432C927.525888%20283.365376%20741.439488%2097.28%20511.891456%2097.28m0%2040.96c50.597888%200%2099.661824%209.901056%20145.82784%2029.427712%2044.61056%2018.868224%2084.683776%2045.889536%20119.10656%2080.31232%2034.422784%2034.422784%2061.444096%2074.496%2080.313344%20119.107584%2019.525632%2046.164992%2029.426688%2095.228928%2029.426688%20145.82784s-9.901056%2099.662848-29.426688%20145.82784c-18.869248%2044.61056-45.89056%2084.6848-80.313344%20119.107584s-74.496%2061.443072-119.10656%2080.31232c-46.166016%2019.526656-95.229952%2029.426688-145.82784%2029.426688-50.598912%200-99.662848-9.900032-145.828864-29.426688-44.61056-18.869248-84.683776-45.889536-119.10656-80.31232-34.422784-34.422784-61.444096-74.497024-80.313344-119.107584C147.117056%20612.57728%20137.216%20563.514368%20137.216%20512.915456s9.901056-99.662848%2029.426688-145.82784c18.869248-44.611584%2045.89056-84.6848%2080.313344-119.107584s74.496-61.444096%20119.10656-80.31232C412.228608%20148.140032%20461.292544%20138.24%20511.891456%20138.24'%20fill='%23000000'%20/%3e%3c/svg%3e";
const CloseIcon = "data:image/svg+xml,%3c!DOCTYPE%20svg%20PUBLIC%20'-//W3C//DTD%20SVG%201.1//EN'%20'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Transformed%20by:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20stroke='%23ffae00'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'/%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3ccircle%20cx='12'%20cy='12'%20r='10'%20stroke='%23ea9a10'%20stroke-width='1.5'/%3e%3cpath%20d='M14.5%209.50002L9.5%2014.5M9.49998%209.5L14.5%2014.5'%20stroke='%23ea9a10'%20stroke-width='1.5'%20stroke-linecap='round'/%3e%3c/g%3e%3c/svg%3e";
const SortUpIcon = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M13%2012H21M13%208H21M13%2016H21M6%207V17M6%207L3%2010M6%207L9%2010'%20stroke='%23000000'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
const SortDownIcon = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M13%2012H21M13%208H21M13%2016H21M6%207V17M6%2017L3%2014M6%2017L9%2014'%20stroke='%23000000'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
const PikachuError = "/assets/pikachu-error-CQ68i-xk.gif";
const PikachuEatingGif = "/assets/pokemon-eating-CcVB0vC3.gif";
const NoCaughtPokemonsGif = "/assets/no-caught-pokemons-CD8occn7.gif";
const PlaceholderImg = "/assets/placeholder-B7_SX9U9.jpg";
const POKEMON_URL = (id) => `/pokemons/${id}`;
const POKEMONS_URL = "/";
const POKEMONS_CAUGHT_URL = "/pokedex";
const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [store] = useLocalStoreContext();
  const { exportAsCSV } = useExportCSV();
  const formattedPokemons = store?.caughtPokemons?.map(
    (p) => ({
      id: p.id,
      name: p.name,
      types: p?.types?.map(({ type }) => type.name)?.join(", "),
      height: `${p.height * 10}cm`,
      weight: `${p.weight / 10}kg`,
      timestamp: p?.timestamp
    })
  );
  return /* @__PURE__ */ jsxs("nav", { className: "py-6 flex justify-between", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "flex items-center gap-2 cursor-pointer",
        onClick: () => navigate(POKEMONS_URL),
        children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-full w-6 h-6 md:w-10 md:h-10", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: PikachuEatingGif,
              alt: "logo",
              className: "w-full h-full object-cover ring-2 ring-white shadow-sm"
            }
          ) }),
          /* @__PURE__ */ jsx("h1", { className: "font-bold text-sm md:text-2xl", children: "Pokémon" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          className: "export-csv-button",
          onClick: () => exportAsCSV({
            pokemons: formattedPokemons,
            link: "caught-pokemons"
          }),
          children: "Export CSV"
        }
      ),
      /* @__PURE__ */ jsx(CaughtPokemons, {}),
      pathname === POKEMONS_URL && /* @__PURE__ */ jsx(ViewSwitcher, {})
    ] })
  ] });
};
const Button = ({ children, className, ...rest }) => {
  return /* @__PURE__ */ jsx(
    "button",
    {
      id: "exportCsvBtn",
      className: [
        `px-3 py-2 h-10 text-slate-900 rounded-lg font-medium shadow-sm hover:brightness-95 cursor-pointer
        ${className ? ` ${className}` : ""}`,
        rest.disabled ? "hover:!brightness-100 opacity-50 !cursor-not-allowed" : ""
      ].join(" "),
      ...rest,
      children
    }
  );
};
const CaughtPokemons = () => {
  const [store] = useLocalStoreContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      className: [
        "inline-flex items-center gap-2 card-shadow p-1! md:px-3! md:py-2!",
        pathname === POKEMONS_CAUGHT_URL ? "border border-green-800" : ""
      ].join(" "),
      onClick: () => navigate(POKEMONS_CAUGHT_URL),
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            id: "caughtCount",
            className: "px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs md:text-sm",
            children: store.caughtPokemons?.length
          }
        ),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: [
              "text-xs md:text-sm text-slate-600 font-normal",
              pathname === POKEMONS_CAUGHT_URL ? "!font-bold !text-green-800" : ""
            ].join(" "),
            children: "Caught"
          }
        )
      ]
    }
  );
};
const ViewSwitcher = () => {
  const [store, setStore] = useLocalStoreContext();
  return /* @__PURE__ */ jsx(
    Button,
    {
      className: "p-1! md:p-2! bg-white rounded-lg card-shadow",
      id: "toggleViewBtn",
      "aria-label": "toggle-view-button",
      title: "Toggle grid / table",
      onClick: () => setStore(localKeys.view, store.view === "grid" ? "table" : "grid"),
      children: /* @__PURE__ */ jsx(
        "svg",
        {
          id: "toggleIcon",
          "data-testid": "toggleIcon",
          className: "w-5 h-5 text-slate-700",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          children: store.view === "grid" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1.5" }),
            /* @__PURE__ */ jsx("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1.5" }),
            /* @__PURE__ */ jsx("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1.5" }),
            /* @__PURE__ */ jsx("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1.5" })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "3", rx: "1.5" }),
            /* @__PURE__ */ jsx("rect", { x: "3", y: "10.5", width: "18", height: "3", rx: "1.5" }),
            /* @__PURE__ */ jsx("rect", { x: "3", y: "17", width: "18", height: "3", rx: "1.5" })
          ] })
        }
      )
    }
  );
};
const IntroWrapper = () => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "intro-screen",
      "data-testid": "intro-screen",
      className: "fixed inset-0 flex items-center justify-center bg-black intro-fade",
      children: /* @__PURE__ */ jsx("div", { className: "w-48 h-48 pokeball-intro", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: PokemonLogo,
          alt: "Pokeball Intro",
          className: "w-full h-full drop-shadow-2xl"
        }
      ) })
    }
  );
};
const PokemonList = ({ pokemons, params, onPaginate }) => {
  const [store] = useLocalStoreContext();
  const navigate = useNavigate();
  const viewPokemon = async (pokemon) => {
    const pokemonID = pokemon.url.split("/").at(-2);
    navigate(POKEMON_URL(pokemonID));
  };
  const handlePageClick = (data) => {
    onPaginate(data);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      children: store.view === "grid" ? /* @__PURE__ */ jsx(
        PokemonGridView,
        {
          pokemons,
          viewPokemon,
          params,
          handlePageClick
        }
      ) : /* @__PURE__ */ jsx(
        PokemonTableView,
        {
          pokemons,
          viewPokemon,
          params,
          handlePageClick
        }
      )
    },
    store?.view
  ) }) });
};
const PokemonTableView = ({
  pokemons,
  viewPokemon,
  params,
  handlePageClick
}) => {
  const { hasCaughtPokemon } = useUpdatePokemons();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("table", { className: "w-full table-auto border-collapse border border-slate-300 mb-6", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "border border-slate-300 px-4 py-2 text-left", children: "Name" }),
        /* @__PURE__ */ jsx("th", { className: "border border-slate-300 px-4 py-2 text-left", children: "URL" }),
        /* @__PURE__ */ jsx("th", { className: "border border-slate-300 px-4 py-2 text-left", children: "Caught Pokémons" }),
        /* @__PURE__ */ jsx("th", { className: "border border-slate-300 px-4 py-2 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: pokemons?.results?.map((pokemon) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "border border-slate-300 px-4 py-2 text-sm capitalize", children: pokemon.name }),
        /* @__PURE__ */ jsx("td", { className: "border border-slate-300 px-4 py-2 text-sm", children: pokemon.url }),
        /* @__PURE__ */ jsx("td", { className: "border border-slate-300 px-4 py-2", children: hasCaughtPokemon(pokemon) && /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center pointer-events-none", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Caught" }),
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-white/90 rounded-full p-1 shadow-sm", children: /* @__PURE__ */ jsx("img", { src: TickIcon, alt: "tick-icon" }) })
        ] }) }) }),
        /* @__PURE__ */ jsx("td", { className: "flex justify-between border border-slate-300 px-4 py-2", children: /* @__PURE__ */ jsx(
          Button,
          {
            className: "!py-1 !px-2 !text-xs !h-8 rounded-lg border text-sm",
            onClick: () => viewPokemon(pokemon),
            children: "View"
          }
        ) })
      ] }, pokemon.name)) })
    ] }),
    pokemons?.count > params?.limit && /* @__PURE__ */ jsx(
      ReactPaginate,
      {
        className: "react-paginate",
        forcePage: params?.offset / params?.limit,
        breakLabel: "...",
        onPageChange: handlePageClick,
        pageRangeDisplayed: 3,
        previousLabel: "←",
        nextLabel: "→",
        pageCount: Math.ceil(pokemons?.count / params?.limit) ?? 0,
        renderOnZeroPageCount: null
      }
    )
  ] });
};
const PokemonGridView = ({
  pokemons,
  viewPokemon,
  params,
  handlePageClick
}) => {
  const { hasCaughtPokemon } = useUpdatePokemons();
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: pokemons?.results?.map((pokemon) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "border border-slate-300 rounded-lg p-4 flex flex-col justify-between items-center hover:shadow-lg transition-all",
        children: [
          /* @__PURE__ */ jsx(
            "p",
            {
              className: [
                "capitalize",
                hasCaughtPokemon(pokemon) ? "font-bold" : ""
              ].join(" "),
              children: pokemon.name
            }
          ),
          hasCaughtPokemon(pokemon) && /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxs(Button, { className: "flex items-center pointer-events-none", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Caught" }),
            /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-white/90 rounded-full p-1 shadow-sm", children: /* @__PURE__ */ jsx("img", { src: TickIcon, alt: "tick-icon" }) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-between w-full", children: /* @__PURE__ */ jsx(
            Button,
            {
              className: "px-3 py-1 w-full rounded-lg border text-sm",
              onClick: () => viewPokemon(pokemon),
              children: "View"
            }
          ) })
        ]
      },
      pokemon.name
    )) }),
    pokemons?.count > params?.limit && /* @__PURE__ */ jsx(
      ReactPaginate,
      {
        className: "react-paginate",
        breakLabel: "...",
        forcePage: params?.offset / params?.limit,
        onPageChange: handlePageClick,
        pageRangeDisplayed: 3,
        previousLabel: "←",
        nextLabel: "→",
        pageCount: Math.ceil(pokemons?.count / params?.limit) ?? 0,
        renderOnZeroPageCount: null
      }
    )
  ] });
};
const PokemonNote = ({ note, onSubmit }) => {
  const [pokemonNote, setPokemonNote] = useState("");
  useEffect(() => {
    if (note) setPokemonNote(note);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
    /* @__PURE__ */ jsx("label", { htmlFor: "add-note", className: "block font-bold", children: "Add Note:" }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        "aria-label": "Pokemon Note",
        className: "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200 shadow-sm text-sm",
        id: "add-note !outline-none !min-h-[500px]",
        value: pokemonNote,
        style: {
          minHeight: "300px"
        },
        onChange: (e) => setPokemonNote(e.target.value)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          "aria-label": "Add Note",
          className: "bg-white border text-slate-700 !text-xs !h-8",
          onClick: () => onSubmit(pokemonNote),
          children: "Add Note"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          className: "!bg-red-400 !text-white text-slate-700 !text-xs !h-8",
          onClick: () => onSubmit(""),
          children: "Clear Note & Close"
        }
      )
    ] })
  ] });
};
const PokemonInfoHeader = ({ pokemon }) => /* @__PURE__ */ jsxs("header", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6", children: [
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "capitalize text-3xl sm:text-4xl font-extrabold leading-tight", children: pokemon?.name }),
    /* @__PURE__ */ jsxs("div", { className: "text-sm text-slate-500 mt-1", children: [
      "No. ",
      pokemon?.order
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Types:" }),
      pokemon?.types?.map(({ type }) => /* @__PURE__ */ jsx(
        "span",
        {
          className: `inline-block px-4 py-2 rounded-full text-sm font-semibold capitalize border
                  `,
          "aria-label": type.name,
          children: type.name
        },
        type.name
      ))
    ] })
  ] }),
  /* @__PURE__ */ jsx("div", { className: "w-44 h-44 sm:w-56 sm:h-56 rounded-lg bg-white/80 flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(
    "img",
    {
      src: pokemon?.sprites?.other?.["official-artwork"]?.front_default ?? PlaceholderImg,
      alt: `artwork`,
      className: "max-w-full max-h-full object-contain",
      loading: "eager",
      onError: (e) => {
        e.currentTarget.src = PokemonLogo;
      }
    }
  ) })
] });
const PokemonSkills = ({ pokemon }) => {
  const [store] = useLocalStoreContext();
  const pokemonCaught = store?.caughtPokemons?.find(
    (p) => p?.id === pokemon?.id
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "section",
      {
        "aria-labelledby": "physical-stats",
        className: "grid grid-cols-2 gap-6 mb-6",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Height" }),
            /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold mt-1", children: [
              pokemon?.height * 10,
              "cm"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Weight" }),
            /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold mt-1", children: [
              pokemon?.weight / 10,
              "kg"
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("section", { "aria-labelledby": "base-stats", className: "mb-6", children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          id: "base-stats",
          className: "text-sm text-slate-600 font-semibold mb-3",
          children: "Base Stats"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl p-4 shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-600", children: "Stat label" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-medium", children: pokemon?.base_experience })
        ] }),
        /* @__PURE__ */ jsx(
          StatBar,
          {
            value: pokemon?.base_experience,
            max: 100,
            ariaLabel: "Base expoerience"
          }
        )
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mb-6 flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Moves" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-slate-800 capitalize text-sm", children: [
          pokemon?.moves?.length ? pokemon?.moves?.map(({ move }) => move.name).join(", ") : "...",
          "."
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Abilities" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-slate-800 capitalize text-sm", children: [
          pokemon?.abilities?.length ? pokemon?.abilities?.map(({ ability }) => ability.name).join(", ") : "...",
          "."
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Forms" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-slate-800 capitalize text-sm", children: [
          pokemon?.forms?.length ? pokemon?.forms?.map(({ name }) => name).join(", ") : "...",
          "."
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-500", children: "Note" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-slate-800 text-sm", children: (pokemonCaught?.note || "...") ?? "Add note..." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right text-sm text-slate-500", children: [
          /* @__PURE__ */ jsx("div", { children: "Added to Pokédex" }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-slate-700", children: pokemonCaught?.timestamp ?? "..." })
        ] })
      ] })
    ] })
  ] });
};
const StatBar = ({ value, max = 255, ariaLabel }) => {
  const pct = Math.max(
    0,
    Math.min(100, Math.round((value ?? 0) / max * 100))
  );
  return /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(
    "div",
    {
      role: "progressbar",
      "aria-valuenow": value,
      "aria-valuemin": 0,
      "aria-valuemax": max,
      "aria-label": ariaLabel,
      className: "w-full h-2 bg-slate-100 rounded-full overflow-hidden",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          style: { width: `${pct}%` },
          className: "h-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-red-400"
        }
      )
    }
  ) });
};
const PokemonAction = ({
  pokemon,
  sharePokemon
}) => {
  const { catchPokemon, removePokemon, hasCaughtPokemon } = useUpdatePokemons();
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("footer", { className: "flex flex-col sm:flex-row items-center gap-3 sm:justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        className: "bg-red-500 !text-white font-semibold hover:brightness-95",
        onClick: sharePokemon,
        children: "Share"
      }
    ),
    hasCaughtPokemon(pokemon) ? /* @__PURE__ */ jsxs(
      Button,
      {
        className: "border bg-red !text-white text-sm capitalize",
        onClick: () => removePokemon(pokemon),
        children: [
          "Remove ",
          pokemon?.name
        ]
      }
    ) : /* @__PURE__ */ jsxs(
      Button,
      {
        className: "border capitalize",
        onClick: () => catchPokemon(pokemon),
        children: [
          "Catch ",
          pokemon?.name
        ]
      }
    )
  ] }) }) });
};
const PokedexCharacters = ({
  sortBy,
  sortDirection,
  sortedPokemons,
  pokemonSelected,
  updatePokemonSelections,
  setShowModal,
  setSelectedPokemonItem
}) => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      layout: true,
      className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6",
      layoutDependency: sortBy + sortDirection,
      children: sortedPokemons()?.map((pokemon) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          layout: true,
          transition: { layout: { duration: 0.3, ease: "easeInOut" } },
          className: [
            "border border-slate-300 rounded-lg p-4 flex flex-col justify-between items-center hover:shadow-lg transition-all",
            pokemonSelected(pokemon) ? "!border-red-400" : ""
          ].join(" "),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "w-full flex justify-between", children: [
              /* @__PURE__ */ jsx("h5", { className: "font-bold capitalize text-sm", children: pokemon.name }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  className: [
                    `inline-block !px-4 !py-2 !h-8 !rounded-lg !text-xs font-semibold capitalize border`,
                    pokemonSelected(pokemon) ? "!border-red-400 !text-red-400" : ""
                  ].join(" "),
                  onClick: () => updatePokemonSelections(pokemon),
                  children: pokemonSelected(pokemon) ? "Unselect" : "Select"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-44 h-44 sm:w-56 sm:h-56", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: pokemon?.sprites?.other?.["official-artwork"]?.front_default,
                alt: "artwork",
                className: "max-w-full max-h-full object-contain",
                loading: "lazy",
                onError: (e) => {
                  e.currentTarget.src = PokemonLogo;
                }
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold", children: "Date added" }),
                /* @__PURE__ */ jsx("span", { children: pokemon?.timestamp })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-bold", children: "Height" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    pokemon?.height * 10,
                    "cm"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs flex flex-col", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-bold", children: "Weight" }),
                  /* @__PURE__ */ jsxs("span", { className: "self-end", children: [
                    pokemon?.weight / 10,
                    "kg"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold", children: "Note" }),
                /* @__PURE__ */ jsx("span", { children: pokemon?.note || "..." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2 w-full", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  className: "bg-white mt-2 border border-green-400 !text-green-700 !text-xs !py-1 !h-8",
                  onClick: () => {
                    setShowModal((prev) => !prev);
                    setSelectedPokemonItem(pokemon);
                  },
                  children: "Add Note"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  "aria-label": "View Pokémon",
                  className: "bg-white mt-2 border border-green-400 !text-green-700 !text-xs !py-1 !h-8",
                  onClick: () => navigate(POKEMON_URL(String(pokemon.id))),
                  children: "View"
                }
              )
            ] })
          ]
        },
        pokemon.id
      ))
    }
  );
};
const sortOptions = [
  { label: "Name", value: "name" },
  { label: "Height", value: "height" },
  { label: "Weight", value: "weight" },
  { label: "Timestamp", value: "timestamp" }
];
const PokedexHeader = ({
  updateSorting,
  setSortDirection,
  sortDirection,
  selectedPokemons,
  releaseSelectedPokemons
}) => {
  const [store] = useLocalStoreContext();
  return /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center mb-4", children: !!store?.caughtPokemons?.length && /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3 justify-between w-full", children: [
    /* @__PURE__ */ jsxs("h4", { className: "font-bold text-sm md:text-lg flex items-center gap-1", children: [
      /* @__PURE__ */ jsx("span", { children: "My Pokédex" }),
      /* @__PURE__ */ jsx("div", { className: "w-8 animate-spin", children: /* @__PURE__ */ jsx("img", { src: PokemonLogo, alt: "pikachu-eating", className: "w-full" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "max-w-[150px] h-full appearance-none p-2 pr-10 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 cursor-pointer text-xs",
          onChange: updateSorting,
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Sort" }),
            sortOptions.map(({ label, value }) => /* @__PURE__ */ jsx("option", { value, children: label }))
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          title: "Sort up/down",
          "aria-label": "sort up/down",
          className: "border border-gray-300",
          onClick: () => setSortDirection(
            (prev) => prev === "asc" ? "desc" : "asc"
          ),
          children: /* @__PURE__ */ jsx("div", { className: "w-6", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: sortDirection === "asc" ? SortUpIcon : SortDownIcon,
              alt: "sort-icon",
              className: "w-full"
            }
          ) })
        }
      ),
      !!selectedPokemons.length && /* @__PURE__ */ jsxs(
        Button,
        {
          className: "border border-green-500 text-green-800! font-bold! text-xs hover:brightness-95 whitespace-nowrap",
          onClick: releaseSelectedPokemons,
          children: [
            "Release ",
            selectedPokemons.length,
            " selected pokémon",
            selectedPokemons.length > 1 ? "s" : ""
          ]
        }
      )
    ] })
  ] }) });
};
const ErrorPage = () => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center mt-40", children: [
    /* @__PURE__ */ jsx("div", { className: "w-60", children: /* @__PURE__ */ jsx("img", { src: PikachuError, alt: "pikachu-error", className: "w-full" }) }),
    /* @__PURE__ */ jsx("p", { children: "Error loading data..." })
  ] });
};
const PageLoader = () => /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center pt-50", children: /* @__PURE__ */ jsx("div", { className: "w-24 h-24", children: /* @__PURE__ */ jsx("img", { src: RippleLoader, alt: "Ripple loader", className: "w-full h-full" }) }) });
const Modal = ({ children, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed top-0 left-0 w-full h-screen inset-0 flex items-center justify-center bg-white/0 backdrop-blur-md z-50",
        onClick: onClose,
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-white border border-gray-400/40 rounded-2xl p-8 max-w-2xl mx-4 shadow-3xl text-left backdrop-blur-lg w-full relative",
            onClick: (e) => e.stopPropagation(),
            children: [
              children,
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute right-6 top-4 cursor-pointer",
                  onClick: onClose,
                  children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8", children: /* @__PURE__ */ jsx("img", { src: CloseIcon, alt: "close-icon", className: "w-full h-full" }) })
                }
              )
            ]
          }
        )
      }
    ),
    document.body
  );
};
const HomeLayout = ({
  children,
  error = false,
  loading = false
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "max-w-[800px] mx-auto px-6", children: [
    /* @__PURE__ */ jsx(Header, {}),
    loading ? /* @__PURE__ */ jsx(PageLoader, {}) : error ? /* @__PURE__ */ jsx(ErrorPage, {}) : /* @__PURE__ */ jsx("div", { className: "fade-into", children })
  ] });
};
function meta({}) {
  return [{
    title: "Pokemon Go App"
  }, {
    name: "description",
    content: "Welcome to Pokémon Go!"
  }];
}
const index$2 = UNSAFE_withComponentProps(function Home() {
  const [pokemonsParams, setPokemonParams] = useState({
    limit: 12,
    offset: 0
  });
  const {
    loading: loadingPokemon,
    error: errorPokemons,
    data: pokemonsData,
    API
  } = useAxios();
  const [store, setStore] = useLocalStoreContext();
  const refetchPaginatedPokemons = async ({
    selected
  }) => {
    const offset = selected * pokemonsParams.limit;
    await API.getPokemons({
      ...pokemonsParams,
      offset
    });
    if (!errorPokemons) {
      setPokemonParams((prev) => ({
        ...prev,
        offset
      }));
    }
  };
  useEffect(() => {
    let timeout;
    API.getPokemons(pokemonsParams);
    if (!store.pageLoaded) {
      timeout = setTimeout(() => {
        setStore(localKeys.pageLoaded, true);
      }, 2500);
      return;
    }
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return !store.pageLoaded ? /* @__PURE__ */ jsx(IntroWrapper, {}) : /* @__PURE__ */ jsx(HomeLayout, {
    loading: loadingPokemon,
    error: !!errorPokemons,
    children: /* @__PURE__ */ jsx(PokemonList, {
      pokemons: pokemonsData,
      params: pokemonsParams,
      onPaginate: refetchPaginatedPokemons
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$2,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const Pokemon = () => {
  const {
    id
  } = useParams();
  const wrapperElement = useRef(null);
  const navigate = useNavigate();
  const [dataUrl, setDataUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const {
    loading: loadingPokemon,
    error: errorPokemon,
    data: pokemonData,
    API
  } = useAxios();
  const sharePokemon = useCallback(async () => {
    if (!wrapperElement.current) return;
    toPng(wrapperElement.current, {
      style: {
        backgroundColor: "white",
        paddingLeft: "50px",
        paddingRight: "50px"
      }
    }).then((url) => {
      setDataUrl(url);
      setShowModal(true);
    }).catch(console.error);
  }, []);
  const downloadPokemonCard = useCallback(async () => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${pokemonData?.name}-card`;
    link.click();
  }, [pokemonData, dataUrl]);
  useEffect(() => {
    API.getPokemon(id);
  }, []);
  return /* @__PURE__ */ jsxs(HomeLayout, {
    loading: loadingPokemon,
    error: !!errorPokemon,
    children: [/* @__PURE__ */ jsxs(Button, {
      className: "back-btn",
      onClick: () => navigate(-1, {
        state: {
          from: POKEMONS_URL
        }
      }),
      children: ["<", " Back"]
    }), /* @__PURE__ */ jsxs("div", {
      className: "max-w-3xl mx-auto px-4 py-6",
      children: [/* @__PURE__ */ jsxs("div", {
        ref: wrapperElement,
        children: [/* @__PURE__ */ jsx(PokemonInfoHeader, {
          pokemon: pokemonData
        }), /* @__PURE__ */ jsx("hr", {
          className: "my-6 border-slate-100"
        }), /* @__PURE__ */ jsx(PokemonSkills, {
          pokemon: pokemonData
        })]
      }), /* @__PURE__ */ jsx("hr", {
        className: "border-slate-100 my-6"
      }), /* @__PURE__ */ jsx(PokemonAction, {
        pokemon: pokemonData,
        sharePokemon
      }), showModal && /* @__PURE__ */ jsx(Modal, {
        onClose: () => setShowModal(false),
        children: /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("div", {
            className: "flex justify-center",
            children: /* @__PURE__ */ jsx("div", {
              className: "w-160 h-160",
              children: /* @__PURE__ */ jsx("img", {
                src: dataUrl,
                alt: `${pokemonData?.name}-card`,
                className: "w-full h-full object-contain"
              })
            })
          }), /* @__PURE__ */ jsx("div", {
            className: "flex justify-center",
            children: /* @__PURE__ */ jsx(Button, {
              className: "bg-white mt-2 border border-green-400 !text-green-700 !text-xs !py-1 !h-8",
              onClick: downloadPokemonCard,
              children: "Download Image"
            })
          })]
        })
      })]
    })]
  });
};
const index$1 = UNSAFE_withComponentProps(Pokemon);
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$1
}, Symbol.toStringTag, { value: "Module" }));
const Pokedex = () => {
  const [store, setStore] = useLocalStoreContext();
  const navigate = useNavigate();
  const [selectedPokemons, setSelectedPokemons] = useState([]);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortBy, setSortBy] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPokemonItem, setSelectedPokemonItem] = useState({});
  const addPokemonToNote = (pokemonNote) => {
    const checkedIndex = store?.caughtPokemons?.findIndex((p) => p.id === selectedPokemonItem.id);
    if (checkedIndex !== -1) {
      let newCaughtPokemons = [...store?.caughtPokemons ?? []];
      newCaughtPokemons.splice(checkedIndex, 1, {
        ...selectedPokemonItem,
        note: pokemonNote
      });
      setStore(localKeys.caughtPokemons, newCaughtPokemons);
    }
    setShowModal(false);
  };
  function parseToMilliseconds(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }
    return date.getTime();
  }
  const sortedPokemons = useCallback(() => {
    const sorter = (a, b) => {
      return sortDirection === "asc" ? a < b ? -1 : 1 : a < b ? 1 : -1;
    };
    switch (sortBy) {
      case "name":
        return [...store?.caughtPokemons ?? []]?.sort((a, b) => sorter(a.name?.toLowerCase(), b?.name?.toLowerCase()));
      case "height":
        return [...store?.caughtPokemons ?? []]?.sort((a, b) => sorter(a.height, b?.height));
      case "weight":
        return [...store?.caughtPokemons ?? []]?.sort((a, b) => sorter(a.weight, b?.weight));
      case "timestamp":
        return [...store?.caughtPokemons ?? []]?.sort((a, b) => sorter(parseToMilliseconds(a.timestamp), parseToMilliseconds(b?.timestamp)));
      default:
        return [...store?.caughtPokemons ?? []]?.sort((a, b) => sorter(a.name?.toLowerCase(), b?.name?.toLowerCase()));
    }
  }, [sortBy, sortDirection, store?.caughtPokemons]);
  const updateSorting = (e) => {
    setSortBy(e.target.value);
  };
  const pokemonSelected = useCallback((pokemon) => {
    return !!selectedPokemons?.find((p) => p.id === pokemon.id);
  }, [store?.caughtPokemons, selectedPokemons]);
  const updatePokemonSelections = useCallback((pokemon) => {
    const checkedIndex = selectedPokemons.findIndex((p) => p.id === pokemon.id);
    if (checkedIndex === -1) {
      let newCaughtPokemons2 = [...selectedPokemons];
      newCaughtPokemons2 = [...newCaughtPokemons2, pokemon];
      setSelectedPokemons(newCaughtPokemons2);
      return;
    }
    let newCaughtPokemons = [...selectedPokemons];
    newCaughtPokemons = newCaughtPokemons?.filter((p) => p.id !== pokemon.id);
    setSelectedPokemons(newCaughtPokemons);
  }, [store?.caughtPokemons, selectedPokemons]);
  const releaseSelectedPokemons = useCallback(() => {
    const newCaughtPokemons = store?.caughtPokemons?.filter((p) => {
      const selectedPokemonIDs = selectedPokemons.map((p2) => p2.id);
      return !selectedPokemonIDs.includes(p.id);
    });
    setStore(localKeys.caughtPokemons, newCaughtPokemons);
    setSelectedPokemons([]);
  }, [store?.caughtPokemons, selectedPokemons]);
  return /* @__PURE__ */ jsxs(HomeLayout, {
    children: [/* @__PURE__ */ jsxs(Button, {
      className: "back-btn mb-6",
      onClick: () => navigate(-1),
      children: ["<", " Back"]
    }), /* @__PURE__ */ jsx(PokedexHeader, {
      updateSorting,
      setSortDirection,
      sortDirection,
      selectedPokemons,
      releaseSelectedPokemons
    }), /* @__PURE__ */ jsx("div", {
      children: store?.caughtPokemons?.length ? /* @__PURE__ */ jsx(PokedexCharacters, {
        sortBy,
        sortDirection,
        sortedPokemons,
        pokemonSelected,
        updatePokemonSelections,
        setShowModal,
        setSelectedPokemonItem
      }) : /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col items-center",
        children: [/* @__PURE__ */ jsx("div", {
          className: "w-100 md:w-150 mb-6",
          children: /* @__PURE__ */ jsx("img", {
            src: NoCaughtPokemonsGif,
            alt: "no caught pokemons",
            className: "max-w-full max-h-full object-contain",
            loading: "lazy"
          })
        }), /* @__PURE__ */ jsx("h4", {
          className: "font-bold text-sm md:text-lg",
          children: "GOODLUCK CATCHING ME!"
        })]
      })
    }), showModal && /* @__PURE__ */ jsx(Modal, {
      onClose: () => setShowModal(false),
      children: /* @__PURE__ */ jsx(PokemonNote, {
        note: selectedPokemonItem?.note,
        onSubmit: addPokemonToNote
      })
    })]
  });
};
const index = UNSAFE_withComponentProps(Pokedex);
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-C4N0Lf1m.js", "imports": ["/assets/chunk-4WY6JWTD-C6HYQV7D.js", "/assets/index-DcSJJRlm.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-B19-pOK2.js", "imports": ["/assets/chunk-4WY6JWTD-C6HYQV7D.js", "/assets/index-DcSJJRlm.js", "/assets/LocalStore-CoLjZkaN.js"], "css": ["/assets/root-B28RQw8z.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/Pokemons/index": { "id": "routes/Pokemons/index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/index-DJsdygI6.js", "imports": ["/assets/chunk-4WY6JWTD-C6HYQV7D.js", "/assets/LocalStore-CoLjZkaN.js", "/assets/useUpdatePokemons-CqyFS8qT.js", "/assets/HomeLayout-CblElA1v.js", "/assets/index-DcSJJRlm.js", "/assets/proxy-ChNXyaPz.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/Pokemon/index": { "id": "routes/Pokemon/index", "parentId": "root", "path": "/pokemons/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/index-us8nZ7IY.js", "imports": ["/assets/chunk-4WY6JWTD-C6HYQV7D.js", "/assets/HomeLayout-CblElA1v.js", "/assets/LocalStore-CoLjZkaN.js", "/assets/useUpdatePokemons-CqyFS8qT.js", "/assets/index-zNUrgq7u.js", "/assets/index-DcSJJRlm.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/Pokedex/index": { "id": "routes/Pokedex/index", "parentId": "root", "path": "/pokedex", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/index-RI9UR6UM.js", "imports": ["/assets/chunk-4WY6JWTD-C6HYQV7D.js", "/assets/LocalStore-CoLjZkaN.js", "/assets/HomeLayout-CblElA1v.js", "/assets/index-DcSJJRlm.js", "/assets/proxy-ChNXyaPz.js", "/assets/index-zNUrgq7u.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-a8ab7046.js", "version": "a8ab7046", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/Pokemons/index": {
    id: "routes/Pokemons/index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/Pokemon/index": {
    id: "routes/Pokemon/index",
    parentId: "root",
    path: "/pokemons/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/Pokedex/index": {
    id: "routes/Pokedex/index",
    parentId: "root",
    path: "/pokedex",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
