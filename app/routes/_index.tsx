import { type V2_MetaFunction, type LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { path, fs } from '~/utils/path.server';
import { bundleMDX } from "~/utils/compile-mdx.server";


export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type LoaderData = {
  slug: string;
  meta: {
    [key: string]: any
  }
}[];

export const loader : LoaderFunction = async () => {
  // Get our working directory for posts
  const pathToPosts = path.join(process.cwd(), 'posts');

  // Get the directories of the blog entries
  // right now we are just assuming that there will be no rogue files
  // and the structure will be posts -> post-dir -> index.md
  const postDirectories = fs.readdirSync(pathToPosts);

  // pull all the front matter for each post and return it so
  // we can list it out.
  const postFrontMatterPromise = postDirectories.map(async (postDirectory) => {
    const pathToMdx = path.join(process.cwd(), 'posts', postDirectory, 'index.mdx');
    const postRootDirectory = pathToMdx.replace(/index.[mdx/md]?$/, '');

    const result =  await bundleMDX({
      file: pathToMdx,
      cwd: postRootDirectory,
    });

    return {
      ...result.frontmatter,
      slug: postDirectory,
    }
  })

  const postFrontMatter = await Promise.all(postFrontMatterPromise);

  return json(postFrontMatter)
}

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>

      <ul>
        {
          data.map(({slug, meta}) => (
            <li key={slug}>
              <Link to={`/posts/${slug}`}>
                {meta.title}
              </Link>
              {meta.description ? (
                <p>{meta.description}</p>
              ) : null
              }
            </li>
          ))
        }
      </ul>
    </div>
  );
}
