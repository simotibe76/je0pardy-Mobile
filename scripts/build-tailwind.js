const fs = require('fs');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

(async () => {
  try {
    const input = 'src/styles/tailwind.css';
    const output = 'css/tailwind.css';

    if (!fs.existsSync(input)) {
      console.error('Input file not found:', input);
      process.exit(1);
    }

    const css = fs.readFileSync(input, 'utf8');
    const result = await postcss([tailwind, autoprefixer]).process(css, { from: input, to: output });

    fs.mkdirSync('css', { recursive: true });
    fs.writeFileSync(output, result.css, 'utf8');
    if (result.map) fs.writeFileSync(output + '.map', result.map.toString(), 'utf8');

    console.log('Built', output);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
