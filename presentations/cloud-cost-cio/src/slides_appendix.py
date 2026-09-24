# ============================================================ APPENDIX ===
# 10 divider
s = S[9]
T(s, 4, "The operational detail")
T(s, 5, "Account, service, cost-centre and project breakdowns, January to August 2026")

# 11 AWS accounts
s = S[10]
T(s, 3, "Consumption by account name")
T(s, 4, "Monthly spend by linked account, excluding Marketplace. Two payers are consolidated here.")
setchart(charts(s)[0], M8, [
 ('aws-prod-Digital',(22332.7,21140.5,21628.9,21144.8,21545.7,21516.4,22251.5,25323.8)),
 ('aws-devTest-digital',(9774.7,9293.5,13019.5,12889.1,14478.5,13224.0,13679.0,13603.9)),
 ('customers3-prod',(886.8,13482.4,11082.4,2357.5,4222.2,6507.6,9065.8,13088.4)),
 ('aws-preProd-digital',(10763.5,9195.1,10753.1,10593.4,11424.8,10158.6,10824.2,10943.3)),
 ('Harel Insurance',(6065.7,3782.0,6398.0,8584.5,3830.4,6197.6,5139.9,9394.4)),
 ('aws-foundation-security',(8241.0,7426.2,8018.5,7845.0,8595.8,8586.6,8752.4,8937.9)),
 ('cloudops-network',(6243.5,5752.8,7021.8,6897.9,7152.3,7100.4,7373.1,7424.1)),
 ('aws-foundation-sharedservices',(6557.2,5506.8,5797.0,5754.8,6022.6,6015.6,6067.4,6046.2)),
 ('All other',(6260.2,7003.2,12141.2,5862.1,5790.1,7274.4,-6323.6,11770.9))])
T(s, 8,  "TOTAL, JAN-AUG"); T(s, 9,  "$690K"); T(s, 10, "+38.7% Jul to Aug")
T(s, 12, "AUGUST");         T(s, 13, "$107K"); T(s, 14, "no credit applied this month")
T(s, 15, "WHAT MOVED")
T(s, 17, "customers3-prod rose to $13.1K on S3 alone")
T(s, 19, "aws-prod-Digital up $3.1K; Harel Insurance up $4.3K")
T(s, 21, "ai-factory-dev returns to normal: July carried the MAP credit")

# 12 AWS services
s = S[11]
T(s, 3, "Consumption by service name")
T(s, 4, "Same total, cut by service. Marketplace excluded and reported separately.")
setchart(charts(s)[0], M8, [
 ('EC2 - Compute',(31180.7,28236.7,32994.9,32045.9,35082.6,33427.9,35426.3,36296.6)),
 ('S3 - Glacier Deep Archive',(0,10.2,942.3,1640.3,3099.7,5289.1,7425.0,10586.0)),
 ('Business Support',(3876.9,4269.0,4581.2,4108.0,4478.1,4839.1,5893.5,7237.8)),
 ('CloudWatch Log Groups',(2791.6,2486.9,2914.1,2895.9,3040.1,3061.8,2991.1,6150.7)),
 ('VPC - Transit Gateway',(3925.7,3570.9,3964.0,3878.0,4428.7,4573.6,4657.3,4521.8)),
 ('RDS - Compute',(4939.7,3272.2,3522.0,3408.1,3521.7,4011.4,4355.0,4355.0)),
 ('Direct Connect - Port Hours',(3794.4,3427.2,3794.4,3672.0,3794.4,3672.0,3794.4,3794.4)),
 ('S3 - API and Storage',(2640.1,14740.6,11198.8,2637.9,3130.2,3335.1,3823.4,4738.1)),
 ('All other',(23976.2,22568.8,31948.7,27643.0,22486.9,24371.2,8463.7,28852.5))])
T(s, 8,  "TOTAL, JAN-AUG"); T(s, 9,  "$690K"); T(s, 10, "August is the largest month")
T(s, 12, "LARGEST SERVICE"); T(s, 13, "EC2 - Compute"); T(s, 14, "34% of August")
T(s, 15, "WHAT MOVED")
T(s, 17, "Glacier Deep Archive keeps climbing, now $10.6K")
T(s, 19, "CloudWatch Log Groups doubled to $6.2K")
T(s, 21, "Business Support tracks the bill it is priced on")

# 13 GCP
s = S[12]
T(s, 3, "Small, and now falling")
T(s, 4, "The smallest provider by a wide margin. All statements reconcile to their invoices.")
setchart(charts(s)[0], ['Mar','Apr','May','Jun','Jul','Aug'], [
 ('Vertex AI',(0,0,378.8,957.5,2359.0,1522.0)),
 ('Compute Engine',(0,221.7,714.2,977.3,1011.5,1031.0)),
 ('Networking',(0,74.5,311.4,303.7,310.0,314.0)),
 ('Support',(0,0,26.4,98.2,141.6,117.0)),
 ('Gemini API',(395.8,134.7,92.4,0,0,0)),
 ('other services',(0.1,9.2,-74.0,-117.3,-115.1,-149.4))])
T(s, 9,  "GCP, AUGUST");      T(s, 10, "$2,835"); T(s, 11, "1.0% of the total cloud bill")
T(s, 13, "VERTEX AI, AUGUST"); T(s, 14, "$1,522"); T(s, 15, "−36% on July")
T(s, 17, "EVERYTHING ELSE");   T(s, 18, "flat");   T(s, 19, "Compute, networking and DNS unchanged")
T(s, 5, "Vertex AI fell 36% and took GCP down with it. It is the only AI line in the estate that dropped, and at this size it changes nothing — but it is the one place where AI spend went down rather than up.")

# 14 Azure services
s = S[13]
T(s, 3, "Consumption by service name")
T(s, 4, "Same total, cut by service. Charges exclude Marketplace purchases.")
setchart(charts(s)[0], M8, [
 ('Virtual Machines',(58546.1,48277.0,52579.3,51502.8,57466.0,52188.5,53314.3,44488.2)),
 ('Storage',(24139.4,22951.0,22458.1,22680.5,24615.2,25022.5,26364.2,27443.5)),
 ('GitHub',(2778.5,3618.0,4319.1,4079.6,6467.0,16654.2,19259.8,24027.9)),
 ('Virtual Network',(12726.2,12145.0,14087.6,15311.8,18338.3,18565.0,21999.6,20882.8)),
 ('Other services',(12983.6,13665.0,12860.9,10010.1,14322.0,16092.7,17360.8,17665.1)),
 ('Foundry Models',(1353.4,2260.0,4236.4,8369.4,11512.8,15453.3,12291.2,10034.9)),
 ('Microsoft Copilot Studio',(97.4,100.0,116.9,130.4,80.2,0.2,8919.7,9906.0)),
 ('Azure Databricks',(24556.1,18645.0,22427.9,19936.3,0,0,0,0)),
 ('All other',(15408.4,17612.0,23130.1,17217.0,18194.9,24437.0,27397.0,25792.7))])
T(s, 8,  "TOTAL, JAN-AUG"); T(s, 9,  "$1.30M"); T(s, 10, "−3.6% Jul to Aug")
T(s, 12, "LARGEST SERVICE"); T(s, 13, "Virtual Machines"); T(s, 14, "25% of August")
T(s, 15, "WHAT MOVED")
T(s, 17, "Virtual Machines fell $8,826, the largest single move")
T(s, 19, "GitHub rose again, $19.3K to $24.0K")
T(s, 21, "Databricks stays at $0 — drawn against the pre-purchase")

# 15 DataCloud
s = S[14]
T(s, 3, "Cost centre: DataCloud")
T(s, 4, "The largest Azure cost centre, by service and by subscription.")
T(s, 7, "TOTAL, JAN-AUG"); T(s, 8, "$390K"); T(s, 9, "+3.6% Jul to Aug")
T(s, 11, "LARGEST SUBSCRIPTION"); T(s, 12, "DataCloud prod"); T(s, 13, "76% of August")
T(s, 15, "LARGEST SERVICE"); T(s, 16, "Virtual Machines"); T(s, 17, "22% of August")
c = charts(s)
setchart(c[0], M8, [
 ('Virtual Machines',(8001.7,8851.0,9977.0,8938.3,10192.3,10365.6,11078.3,11266.7)),
 ('Azure Databricks',(13661.8,14023.0,19412.0,16633.5,0,0,0,0)),
 ('Storage',(5134.3,5630.0,5747.0,5515.4,6124.6,6488.3,6847.1,6917.6)),
 ('Virtual Network',(4756.2,4988.0,5905.3,5036.8,5067.5,6698.6,7400.6,7093.9)),
 ('Foundry Models',(1347.1,2243.0,1274.5,4218.1,10329.6,5770.0,6649.8,8990.8)),
 ('Foundry Tools',(4271.5,4337.0,3298.7,1922.7,3305.2,5675.5,6603.6,5935.9)),
 ('All other',(10289.4,9126.0,8922.0,7970.1,8905.2,9392.6,10538.4,10683.1))])
setchart(c[1], M8, [
 ('DataCloud prod',(40269.8,41870.1,48649.0,42196.4,29318.0,33038.9,36010.2,38518.0)),
 ('Solugen Production',(854.2,702.8,620.9,1545.5,10022.0,6749.2,8415.9,7128.0)),
 ('DataCloud dev',(3242.7,2995.2,2380.0,3985.6,1715.0,1838.6,1579.0,1324.0)),
 ('INSAIT Production',(1063.6,1914.4,1364.5,1354.4,1456.6,1604.5,1983.4,2721.0)),
 ('DataCloud dev 1',(324.2,275.0,285.9,269.8,281.6,269.2,278.2,298.0)),
 ('Sandbox System',(263.9,308.0,265.0,260.1,335.8,256.1,267.4,275.0)),
 ('All other',(1443.5,1132.5,971.1,623.2,796.1,633.9,583.6,623.0))])
T(s, 5, "Databricks has billed at $0 since May, drawn against the April pre-purchase. Foundry Models rose again to $8,991 and is now the growth line here.")

# 16 SAP
s = S[15]
T(s, 3, "Cost centre: SAP")
T(s, 4, "The most stable large workload in the estate, and still the best candidate for reservations.")
T(s, 7, "TOTAL, JAN-AUG"); T(s, 8, "$335K"); T(s, 9, "+1.0% Jul to Aug")
T(s, 11, "LARGEST SUBSCRIPTION"); T(s, 12, "SAP Dev/Test"); T(s, 13, "56% of August")
T(s, 15, "LARGEST SERVICE"); T(s, 16, "Virtual Machines"); T(s, 17, "74% of August")
c = charts(s)
setchart(c[0], M8, [
 ('Virtual Machines',(30152.9,28348.0,31348.0,30597.0,35586.3,31413.0,30117.0,30608.0)),
 ('Storage',(11917.0,10639.0,10074.0,10076.0,10811.8,11077.0,10526.0,10478.0)),
 ('Virtual Network',(195.8,112.0,124.0,153.0,166.7,134.0,238.0,194.0)),
 ('Virtual Machines Licenses',(0,0,0,0,36.5,41.0,43.0,43.0)),
 ('Bandwidth',(0,0,0,0,0,0,0,0))])
setchart(c[1], M8, [
 ('SAP Dev/Test',(23275.7,22687.0,24090.0,23647.0,26321.7,24985.0,23467.0,23001.0)),
 ('SAP Production',(18989.9,16411.0,17456.0,17178.0,20279.6,17680.0,17457.0,18322.0))])
T(s, 5, "Dev/Test has cost more than Production in every month of the year. Virtual machines are roughly three quarters of the bill and barely vary — a flat, reservable profile that is still on demand.")

# 17 Cloud IT
s = S[16]
T(s, 3, "Cost centre: Cloud IT")
T(s, 4, "Shared platform services: network, monitoring and security for everyone else.")
T(s, 7, "TOTAL, JAN-AUG"); T(s, 8, "$248K"); T(s, 9, "−4.0% Jul to Aug")
T(s, 11, "LARGEST SUBSCRIPTION"); T(s, 12, "Prod"); T(s, 13, "58% of August")
T(s, 15, "LARGEST SERVICE"); T(s, 16, "Virtual Network"); T(s, 17, "31% of August")
c = charts(s)
setchart(c[0], M8, [
 ('Virtual Network',(5740.9,5286.0,5960.0,7306.9,8900.5,8855.7,10913.2,10043.1)),
 ('Storage',(5000.4,4756.0,4679.7,4663.4,4758.8,4887.1,6077.6,6053.8)),
 ('Virtual Machines',(4242.9,3549.0,4067.1,3938.6,4539.7,4344.1,4847.4,5593.3)),
 ('Log Analytics',(7300.5,3692.0,10596.1,3912.0,1966.9,2066.7,2306.1,1565.6)),
 ('Sentinel',(1732.0,1468.0,8874.9,3278.0,1333.2,1369.7,1467.7,967.2)),
 ('Other services',(2265.0,1965.0,2206.0,2059.0,2253.5,2467.1,2528.5,2202.2)),
 ('All other',(4634.1,3962.0,4345.8,4241.6,4862.7,4595.3,5280.6,5661.6))])
setchart(c[1], M8, [
 ('Prod',(12493.5,11171.0,12360.1,13593.0,15743.1,15398.0,19303.3,18544.0)),
 ('Shared Resources',(16903.7,12321.0,26897.1,14231.0,10755.4,10557.0,11093.0,9897.0)),
 ('CloudOps',(872.7,555.0,768.7,737.0,972.0,1089.0,1225.7,726.0)),
 ('DataCloud prod',(363.2,357.0,397.3,336.0,370.2,550.0,818.1,812.0)),
 ('DataCloud dev',(189.0,169.0,189.5,184.0,506.7,582.0,573.9,590.0)),
 ('All other',(298.9,262.3,169.3,175.3,278.1,417.3,415.9,1517.8))])
T(s, 5, "Log Analytics and Sentinel have both come down since the March spike. Virtual network is now the largest line and carries the underlying growth.")
