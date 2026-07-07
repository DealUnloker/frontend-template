# Why this directory exists

This stub Pages Router directory is **required**. Without it, Next.js treats the
FSD layer `src/pages/` as a Pages Router directory and fails the build with:

> `pages` and `app` directories should be under the same folder

The root `pages/` shadows `src/pages/`, so the App Router (`app/`) and the FSD
`pages` layer can coexist. Do not delete it.
