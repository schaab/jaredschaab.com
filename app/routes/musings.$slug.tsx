import { Response, type LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { path } from "~/utils/path.server";
import { bundleMDX } from "~/utils/compile-mdx.server";
import { getMDXComponent } from 'mdx-bundler/client'


export const loader: LoaderFunction = async ({ params }) => {
  if (!params.slug) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const pathToPostDir = path.join(process.cwd(), 'posts')
  const pathToPost = path.join(process.cwd(), 'posts', params.slug, 'index.mdx');
  const result = await bundleMDX({
    file: pathToPost,
    cwd: pathToPostDir,
  });

  return json(result);
}

export default function Post() {
  const { frontmatter, code } = useLoaderData();
  const Component = useMemo(() => getMDXComponent(code), [code]);

  return (
    <article>
      <header>
        <h2>{frontmatter.meta.title} tetet</h2>
      </header>
      <Component />
    </article>
  )
}
