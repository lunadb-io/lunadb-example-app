# LunaDB Example Application

This is a Todo List application provided to showcase how LunaDB can be used to integrate
real-time collaboration into your project.

It is a SvelteKit project that uses LunaDB to synchronize changes to the overall todo list.
It treats all updates to an individual task as atomic, which means it's a suitable example for
applications where conflicts are best decided by taking the most recent update. We are working
on a multiplayer text editor example for those who need it.

## Developing

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
