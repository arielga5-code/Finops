// Recomputes every figure quoted in the deck from deck_data.json.
// Run after any data refresh or wording change:  node tools/verify_figures.js
const D = require('../deck_data.json');
const s = a => (a||[]).reduce((x,y)=>x+(y||0),0);
const tot = o => Object.values(o).reduce((a,v)=>a+s(v),0);
const R=[]; let bad=0;
function chk(label, claimed, actual, tol){
  tol = tol===undefined ? 0.5 : tol;
  const ok = Math.abs(claimed-actual) <= tol;
  if(!ok) bad++;
  R.push(`${ok?'  ok ':'FAIL'}  ${label.padEnd(52)} claim=${String(claimed).padStart(10)}  actual=${actual.toFixed(2).padStart(12)}`);
}
const K = n => n/1000, M = n => n/1e6;

// ---------- totals ----------
const awsC=s(D.aws_tot), azC=s(D.az_tot), gcpC=s(D.gcp_tot);
const awsMP=s(D.mp_tot), azMP=s(D.amp_tot);
const consumption=awsC+azC+gcpC, committed=awsMP+azMP, all=consumption+committed;
chk('AWS consumption $792K',           792, K(awsC), 0.6);
chk('Azure consumption $1.51M',       1.51, M(azC), 0.005);
chk('GCP $13.5K / $14K',              13.5, K(gcpC), 0.05);
chk('AWS Marketplace $1.82M',         1.82, M(awsMP), 0.005);
chk('Azure Marketplace $542K',         542, K(azMP), 0.6);
chk('Consumption $2.31M',             2.31, M(consumption), 0.005);
chk('Committed $2.36M',               2.36, M(committed), 0.005);
chk('Total cloud $4.67M',             4.67, M(all), 0.005);
chk('AWS all-in $2.61M',              2.61, M(awsC+awsMP), 0.005);
chk('Azure all-in $2.05M',            2.05, M(azC+azMP), 0.005);
chk('AWS avg $88K/mo',                  88, K(awsC/9), 0.6);
chk('Azure avg $167K/mo',              167, K(azC/9), 0.6);
chk('Azure Sep $198K',                 198, K(D.az_tot[8]), 0.6);
chk('Marketplace 70% of AWS total',     70, awsMP/(awsC+awsMP)*100, 0.5);
chk('Databricks 93% of Azure MP',       93, 504000/azMP*100, 0.5);
chk('Databricks 21% of all committed',  21, 504000/committed*100, 0.5);

// ---------- run-rate ----------
const q1=s(D.tot.slice(0,3))/3, q3=s(D.tot.slice(6))/3;
chk('Run-rate +22% Q1->Q3',             22, (q3/q1-1)*100, 0.5);
chk('Q1 avg $238K/mo',                 238, K(q1), 0.6);
chk('Q3 avg $290K/mo',                 290, K(q3), 0.6);
chk('Azure +26% on January',            26, (D.az_tot[8]/D.az_tot[0]-1)*100, 0.5);

// ---------- AI ----------
const ai=s(D.ai_tot);
const nonAI=D.tot.map((v,i)=>v-D.ai_tot[i]);
const aiQ1=s(D.ai_tot.slice(0,3))/3, aiQ3=s(D.ai_tot.slice(6))/3;
const nQ1=s(nonAI.slice(0,3))/3,     nQ3=s(nonAI.slice(6))/3;
chk('AI YTD $412K',                    412, K(ai), 0.6);
chk('AI Sep $102K',                    102, K(D.ai_tot[8]), 0.6);
chk('AI Jan $9K',                        9, K(D.ai_tot[0]), 0.3);
chk('AI 11x Jan->Sep',                  11, D.ai_tot[8]/D.ai_tot[0], 0.5);
chk('AI 34% of Sep consumption',        34, D.ai_tot[8]/D.tot[8]*100, 0.5);
chk('AI 18% of all consumption',        18, ai/consumption*100, 0.5);
chk('AI annualised $1.22M',           1.22, M(D.ai_tot[8]*12), 0.005);
chk('AI +703% Q1->Q3',                 703, (aiQ3/aiQ1-1)*100, 3);
chk('AI Q1 avg $12K/mo',                12, K(aiQ1), 0.6);
chk('AI Q3 avg $93K/mo',                93, K(aiQ3), 0.6);
chk('non-AI -13% Q1->Q3',              -13, (nQ3/nQ1-1)*100, 0.5);
chk('non-AI Q1 avg $226K/mo',          226, K(nQ1), 0.6);
chk('non-AI Q3 avg $196K/mo',          196, K(nQ3), 0.6);

// ---------- AWS ----------
const A=D.aws_acct, S=D.aws_svc, MP=D.aws_mp;
const dig=s(A['aws-prod-Digital'])+s(A['aws-devTest-digital'])+s(A['aws-preProd-digital']);
chk('Digital platform 51%',             51, dig/awsC*100, 0.5);
chk('Digital platform $407K',          407, K(dig), 0.6);
chk('EC2 38% of AWS bill',              38, s(S['EC2 - Compute'])/awsC*100, 0.5);
chk('customers3 low $0.9K',            0.9, K(Math.min(...A['customers3-prod'])), 0.05);
chk('customers3 high $13.5K',         13.5, K(Math.max(...A['customers3-prod'])), 0.05);
chk('AWS Jul dip $77K',                 77, K(D.aws_tot[6]), 0.6);
chk('AWS Aug peak $107K',              107, K(D.aws_tot[7]), 0.6);
chk('AWS Sep $101K',                   101, K(D.aws_tot[8]), 0.6);
chk('MAP credit -$15.3K',            -15.3, K(Math.min(...A['ai-factory-dev'])), 0.05);
chk('Glacier Sep $12K',                 12, K(s(S['S3 - Glacier Deep Archive'].slice(8))), 0.5);
chk('Glacier Jan $0',                    0, K(S['S3 - Glacier Deep Archive'][0]), 0.05);
const mpSorted=Object.entries(MP).sort((a,b)=>s(b[1])-s(a[1]));
chk('Top 9 MP vendors 91%',             91, s(mpSorted.slice(0,9).map(e=>s(e[1])))/awsMP*100, 0.5);
const secV=['Splunk Private Offer Session 3','TrendAI Enterprise Security Solutions','CrowdStrike Falcon Identity Protection','F5 Distributed Cloud Services ','F5 Distributed Cloud Bot Defense','F5 Rules for AWS WAF','Trellix_Private Offer Only','Trellix collaboration security + email security + IVX cloud','(Private) Cortex','Fortinet Cloud Security Platform'];
const missing=secV.filter(n=>!MP[n]);
if(missing.length) R.push('NOTE  security-vendor keys not found: '+JSON.stringify(missing));
chk('Security tooling 72% of MP',       72, s(secV.map(n=>MP[n]?s(MP[n]):0))/awsMP*100, 0.6);
chk('JFrog Sep $158K',                 158, K(s(MP['JFrog Software Supply Chain Platform'])), 0.6);
chk('Harel IL payer $166K',            166, K(tot(D.harel_il)), 0.6);
chk('Glacier 25% of Harel IL',          25, s(D.harel_il['S3 - Glacier Deep Archive'])/tot(D.harel_il)*100, 0.6);

// ---------- Azure ----------
const CC=D.az_cc, AS=D.az_svc;
chk('Top 3 cost centres 73%',           73, (s(CC.datacloud)+s(CC.sap)+s(CC.cloudit))/azC*100, 0.5);
chk('VM+Storage+VNet 57%',              57, (s(AS['Virtual Machines'])+s(AS.Storage)+s(AS['Virtual Network']))/azC*100, 0.5);
chk('VM+Storage+VNet $864K',           864, K(s(AS['Virtual Machines'])+s(AS.Storage)+s(AS['Virtual Network'])), 0.6);
chk('VMs 32% of Azure',                 32, s(AS['Virtual Machines'])/azC*100, 0.5);
chk('AI Factory CC Jan $0.9K',         0.9, K(CC.aifactory[0]), 0.05);
chk('AI Factory CC Sep $27.4K',       27.4, K(CC.aifactory[8]), 0.05);
chk('GitHub May $6.5K',                6.5, K(AS.GitHub[4]), 0.05);
chk('GitHub Sep $28.4K',              28.4, K(AS.GitHub[8]), 0.05);
chk('CloudOps Jun $0.3K',              0.3, K(CC.cloudops[5]), 0.05);
chk('CloudOps Sep $11.3K',            11.3, K(CC.cloudops[8]), 0.05);

// ---------- AI detail ----------
const B=D.bedrock;
chk('Bedrock YTD $128K',               128, K(tot(B)), 0.6);
chk('Bedrock Sep $41K / $41.1K',      41.1, K(s(Object.values(B).map(v=>v[8]))), 0.1);
chk('Bedrock Mar $0.8K',               0.8, K(s(Object.values(B).map(v=>v[2]))), 0.05);
chk('Bedrock 49x Mar->Sep',             49, s(Object.values(B).map(v=>v[8]))/s(Object.values(B).map(v=>v[2])), 1);
chk('Opus5+Sonnet4.6 = 65% of Sep',     65, (B['Claude Opus 5'][8]+B['Claude Sonnet 4.6'][8])/s(Object.values(B).map(v=>v[8]))*100, 0.6);
const AIF=D.aif;
chk('AI Factory programme $246K',      246, K(tot(AIF)), 0.6);
chk('AI Factory core $139K',           139, K(s(AIF.Aifactory)), 0.6);
chk('Solugen $47K',                     47, K(s(AIF.Solugen)), 0.6);
chk('OCR $43K',                         43, K(s(AIF['Document Intelligence (OCR Services)'])), 0.6);
chk('INSAIT $16K',                      16, K(s(AIF.INSAIT)), 0.6);
chk('Foundry $120K',                   120, K(tot(D.foundry)), 0.6);
chk('Foundry 37 SKUs',                  37, Object.keys(D.foundry).length, 0);
chk('GCP Vertex+Gemini 52%',            52, (s(D.gcp['Vertex AI'])+s(D.gcp['Gemini API']))/gcpC*100, 0.6);
chk('Vertex $6.5K',                    6.5, K(s(D.gcp['Vertex AI'])), 0.05);
chk('Gemini $0.6K',                    0.6, K(s(D.gcp['Gemini API'])), 0.05);

// ---------- savings (constants from the source deck) ----------
const impl={'Decommission North Europe':70452,'VM RI (Azure)':66783,'Compute savings plan':65335,
  'Removed unnecessary VMs':28105,'Idle unattached disks':20576,'RDS RI (AWS)':7944,
  'Unused SQL expiring RI':4563,'SageMaker cleanup':2797,'App Service RI + refund':1152};
const avoid={'CloudWatch alert':219000,'E1 alert':71905,'blob RI renewal':9432,'EKS ext support':8760,'Redis RI renewal':876};
const pipeBU={SAP:79989,CloudIT:35309,'AI Factory':33961,'Data Cloud':17851,Actuary:8002,AWS:7196,'Azure Sandbox':4430,CloudOps:2130,ITSec:1173};
const pipeAct={'VM RI':47063,'VM rightsize':30582,'PostgreSQL RI':21296,'Premium->standard':21014,
  'Sched shutdown':24779,'Idle reserved disks':13208,'AKS RI':9927,'Idle unattached':7265,'Other':14907};
const iS=Object.values(impl).reduce((a,b)=>a+b), aS=Object.values(avoid).reduce((a,b)=>a+b);
const pB=Object.values(pipeBU).reduce((a,b)=>a+b), pA=Object.values(pipeAct).reduce((a,b)=>a+b);
chk('Implemented $268K (=267,707)',    268, K(iS), 0.4);
chk('Avoided $310K (=309,973)',        310, K(aS), 0.4);
chk('Total returned $578K',            578, K(iS+aS), 0.4);
chk('Pipeline by BU $190K',            190, K(pB), 0.4);
chk('Pipeline by action = by BU',       pB, pA, 2);
chk('25% of YTD metered consumption',   25, (iS+aS)/consumption*100, 0.6);
chk('Top 5 implemented = 94%',          94, (70452+66783+65335+28105+20576)/iS*100, 0.6);
chk('VM RI + savings plan $132K',      132, K(66783+65335), 0.6);
chk('Two alerts $291K',                291, K(219000+71905), 0.6);
chk('Reservations $78K of pipeline',    78, K(47063+21296+9927), 0.6);
chk('Reservations 41% of pipeline',     41, (47063+21296+9927)/pB*100, 0.6);
chk('VM reservation gap $47K',          47, K(47063), 0.6);
chk('North Europe $5,871/mo',         5871, 1397+3601+872, 1);
chk('North Europe $70K annualised',     70, K(5871*12), 0.6);
chk('Azure increase $56,400/yr',     56400, 4700*12, 1);

// ---------- coverage (September compute, from source deck tables) ----------
chk('AWS coverage total $35,748',    35748, 17416+15837+2495, 1);
chk('AWS covered 93%',                  93, (17416+15837)/35748*100, 0.6);
chk('Azure coverage total $55,576',  55576, 25606+20346+9120+504, 1);
chk('Azure covered 54%',                54, (20346+9120+504)/55576*100, 0.6);
chk('Azure VM Sep matches table', 55576, AS['Virtual Machines'][8], 2);
chk('AWS EC2 Sep matches table',  35748, S['EC2 - Compute'][8], 5);
chk('GitHub budget 74%',                74, 2959.51/4000*100, 0.6);

// ---------- claims added in the restructured deck ----------
chk('September is the peak month $301K',  301, K(Math.max(...D.tot)), 0.6);
chk('  ...and it is September',             8, D.tot.indexOf(Math.max(...D.tot)), 0);
chk('Harel IL Jul credit -$13.0K',      -13.0, K(D.harel_il['Other services'][6]), 0.1);
const dAIF = D.az_cc.aifactory[8] - D.az_cc.aifactory[0];
const dGH  = D.az_svc.GitHub[8]   - D.az_svc.GitHub[0];
const dCO  = D.az_cc.cloudops[8]  - D.az_cc.cloudops[0];
chk('AI Factory is the largest Azure riser', 1, (dAIF > dGH && dAIF > dCO) ? 1 : 0, 0);

console.log(R.join('\n'));
console.log('\n' + (bad? `*** ${bad} MISMATCH(ES) ***` : 'all claims reconcile'));
