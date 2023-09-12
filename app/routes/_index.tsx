import {
  type V2_MetaFunction,
  type LoaderFunction,
  type LinksFunction,
  json,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { path, fs } from "~/utils/path.server";
import { bundleMDX } from "~/utils/compile-mdx.server";

import stylesheet from "~/styles/home.css";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

type LoaderData = {
  slug: string;
  meta: {
    [key: string]: any;
  };
}[];

export const loader: LoaderFunction = async () => {
  // Get our working directory for posts
  const pathToPosts = path.join(process.cwd(), "posts");

  // Get the directories of the blog entries
  // right now we are just assuming that there will be no rogue files
  // and the structure will be posts -> post-dir -> index.md
  const postDirectories = fs.readdirSync(pathToPosts);

  // pull all the front matter for each post and return it so
  // we can list it out.
  const postFrontMatterPromise = postDirectories.map(async (postDirectory) => {
    const pathToMdx = path.join(
      process.cwd(),
      "posts",
      postDirectory,
      "index.mdx"
    );
    const postRootDirectory = pathToMdx.replace(/index.[mdx/md]?$/, "");

    const result = await bundleMDX({
      file: pathToMdx,
      cwd: postRootDirectory,
    });

    return {
      ...result.frontmatter,
      slug: postDirectory,
    };
  });

  const postFrontMatter = await Promise.all(postFrontMatterPromise);

  return json(postFrontMatter);
};

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <main className="wrapper">
      <section id="bio" className="block">
        <div className="bio-container">
          <figure className="bio-photo">
            <img
              src="/images/jared.jpg"
              alt="Jared Schaab smiling with his arms crossed against a brick wall"
            />
            <figcaption>
              <span>
                Photo credit:&nbsp;
                <a href="https://www.houseofschaab.photography/">
                  House of Schaab Photography
                </a>
              </span>
            </figcaption>
          </figure>

          <p>
            Jared Schaab is an avid learner, lover of food, and always looking
            on the bright side. An experienced Software Developer with over 15
            years of experience with a focus on delivering scalable and
            well-tested code. Two principles drive how I show up at work: 1)
            Great software should integrate seamlessly into our lives and 2)
            behind almost every keyboard is a human (thanks ChatGPT) and they
            deserve to be treated as such. He lives in Vancouver, Wa.
          </p>
        </div>
      </section>
      <section id="musings" className="block">
        <h2>Recent Musings</h2>
        <ul>
          {data
            .filter(({ meta }) => !meta.draft)
            .map(({ slug, meta }) => (
            <li key={slug}>
              <Link to={`/musings/${slug}`}>{meta.title}</Link>
                {meta.description ? <p>{meta.description}</p> : null}
                {new Date(meta.published).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
