const Docma = require('docma');
const Package = require('./package');

Docma.create()
  .build({
    app: {
      title: Package.name,
      base: '/',
      entrance: 'content:readme',
      routing: 'query',
      server: Docma.ServerType.GITHUB,
    },
    markdown: {
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: false,
      smartypants: false,
      tasks: false,
      emoji: true,
    },
    src: [
      { readme: './README.md' },
      { snekfetch: './src/index.js' },
    ],
    dest: './docs',
    jsdoc: {
      plugins: ['jsdoc-dynamic'],
    },
    template: {
      options: {
        title: Package.name,
        navItems: [
          {
            label: 'Readme',
            href: '?content=readme',
          },
          {
            label: 'Documentation',
            href: '?api=snekfetch',
            iconClass: 'ico-book',
          },
          {
            label: 'GitHub',
            href: Package.homepage,
            target: '_blank',
            iconClass: 'ico-md ico-github',
          },
        ],
      },
    },
  })
  .catch(console.error); // eslint-disable-line no-console
