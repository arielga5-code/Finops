const C = require('./build_core.js');
const { applyTheme } = require('./apply_theme.js');

const OUT = process.argv[2] ||
  require('path').join(__dirname, '..', 'Cloud_FinOps_Harel_September_2026_CIO_Redesign_v2.pptx');
const SECTIONS = ['./sec_open.js', './sec_ai.js', './sec_aws.js', './sec_azure.js',
                  './sec_value.js', './sec_close.js', './sec_appendix.js'];

(async () => {
  const pres = C.newDeck();
  for (const f of SECTIONS) {
    let mod;
    try { mod = require(require('path').join(__dirname, f)); } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.includes(f.replace('./',''))) {
        console.log('  (skipping ' + f + ' — not written yet)'); continue;
      }
      throw e;
    }
    mod(pres);
  }
  if (C.LONG_TITLES.length) {
    console.log('\n!! action titles over ' + C.TITLE_MAX + ' chars (will wrap):');
    C.LONG_TITLES.forEach(t => console.log('   ' + t));
    console.log('');
  }
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, C.THEME);
  console.log('wrote ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
