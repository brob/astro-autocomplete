import React, { createElement, Fragment, useEffect, useRef } from "react";
import { render } from "react-dom";
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";
import {Action} from './Action'
import algoliasearch from "algoliasearch/lite";
import { getAlgoliaResults } from "@algolia/autocomplete-js";
import Header from "./Header.jsx"
const searchClient = algoliasearch(
  "MU9BHW5MNS",
  "4a0927c9a6b57b94c6b7601a3cc7c41f"
);

function getQueryPattern(query, flags = "i") {
  const pattern = new RegExp(
    `(${query
      .trim()
      .toLowerCase()
      .split(" ")
      .map((token) => `^${token}`)
      .join("|")})`,
    flags
  );
  return pattern;
}

function highlight(text, pattern) {
  const tokens = text.split(pattern);

  return tokens.map((token) => {
    if (!pattern.test("") && pattern.test(token)) {
      return <mark>{token}</mark>;
    }

    return token;
  });
}

export function AutocompleteItems(props) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    // Initialize autocomplete on the newly created container
    const search = autocomplete({
      container: containerRef.current,
      renderer: { createElement, Fragment },
      render({ children }, root) {       
        render(children, root);
      },
      getSources: ({ query }) => [
        {
          sourceId: "actions",
          templates: {
            item({ item }) {
              return <Action key={item.label} hit={item} />;
            }
          },
          getItems({ state }) {
            const pattern = getQueryPattern(query);

            return [
              {
                label: "/bag",
                placeholder: "  your-id-goes-here",
                onSelect() {
                  const ticketId = query.split(this.label + " ");
                  console.log(ticketId[1]);
                  // Some function to send this ID
                  // to the serverless function
                },
                icon: (
                  <svg
                    width="138"
                    height="212"
                    viewBox="0 0 138 212"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M86.119 18.8795L113.411 43.6006C124.586 53.7225 124.586 71.2775 113.411 81.3994L86.119 106.121C76.403 114.921 61.597 114.921 51.881 106.12L24.5889 81.3994C13.4143 71.2775 13.4143 53.7225 24.5889 43.6006L51.881 18.8795C61.597 10.0787 76.403 10.0787 86.119 18.8795Z"
                      stroke="black"
                      strokeWidth="8"
                    />
                    <mask id="path-2-inside-1" fill="white">
                      <rect y="57" width="138" height="155" rx="3" />
                    </mask>
                    <rect
                      y="57"
                      width="138"
                      height="155"
                      rx="3"
                      fill="white"
                      stroke="black"
                      strokeWidth="16"
                      mask="url(#path-2-inside-1)"
                    />
                  </svg>
                )
              }
            ].filter(({ label }) => pattern.test(label))
            .map((action) => ({
              ...action,
              highlighted: highlight(action.label, pattern)
            }));
          },
          onSelect(params) {
            // item is the full item data
            // setQuery is a hook to set the query state
            const { item, setQuery } = params;

            item.onSelect(params);
            setQuery("");
          },
        },
          {
            sourceId: "episodes",
            getItemUrl({ item }) {
              return `https://www.learnwithjason.dev${item.url}`;
            },
            getItems() {
              return getAlgoliaResults({
                searchClient,
                queries: [
                  {
                    indexName:
                      "netlify_c55763f8-efc8-4ed9-841a-186a011ed84b_main_all",
                    query,
                    params: {
                      hitsPerPage: 1
                    }
                  }
                ]
              });
            },
            templates: {
              header() {
                return <Header text="Learn with Jason episodes" />;
              },
              item({ item, components }) {
                return (
                  <a
                    className="aa-ItemLink"
                    href={`https://www.learnwithjason.dev${item.url}`}
                  >
                    <div className="aa-ItemContent">
                      <div className="aa-ItemIcon">
                        <img
                          src={item.image}
                          alt={item.title}
                          width="40"
                          height="40"
                        />
                      </div>
                      <div className="aa-ItemContentBody">
                        <div className="aa-ItemContentTitle">
                          <components.Highlight hit={item} attribute="title" />
                        </div>
                        <div className="aa-ItemContentDescription">
                          <components.Snippet hit={item} attribute="content" />
                        </div>
                      </div>
                    </div>
                    <div className="aa-ItemActions">
                      <button
                        className="aa-ItemActionButton aa-DesktopOnly aa-ActiveOnly"
                        type="button"
                        title="Select"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="currentColor"
                        >
                          <path d="M18.984 6.984h2.016v6h-15.188l3.609 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.609 3.609h13.172v-4.031z" />
                        </svg>
                      </button>
                    </div>
                  </a>
                );
              }
            }
          }
      ],
      ...props
    });

    // Destroy the search instance in cleanup
    return () => {
      search.destroy();
    };
  }, [props]);

  return <div ref={containerRef} />;
}
