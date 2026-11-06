# Critic run 41: the click-batch replica (c43_ll4 NOW=click T0=1) of run 40's cases and new attacks on R29b.
FZ='"x":1703.5,"y":445.5'; SH='"x":1715.5,"y":413.5'; SW3='"x":1712.5,"y":416.5'; TOK='"x":1818.5,"y":385.5'
J=[]
def job(name, seed, n, extra, orders, days=60):
    J.append(f"NOW=click T0=1 EXTRA={extra} ORDERS='[{orders}]' npx tsx critic/scripts/c43_ll4.ts {seed} {n} {days} critic/c43_k_{name}.json > critic/c43_k_{name}.log 2>&1")
A='"at":"aboard"'
# run 40's cases
job('steal_freshfuzhou',3517,2,1,f'{{{A},"plus":2,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}}')
job('steal_freshhourbefore',3517,2,1,f'{{{A},"plus":1,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}}')
job('steal_freshdaybefore',3517,2,1,f'{{"at":1,"who":[2],{FZ}}},{{{A},"plus":26,"who":[0,1],{FZ}}}')
job('leaversfirst_fz',3517,2,1,f'{{{A},"plus":2,"who":[0,1],{FZ}}},{{{A},"plus":2,"who":[2],{FZ}}}')
job('click_plus_fresh',3517,2,1,f'{{{A},"plus":2,"who":[0,1,2],{FZ}}}')
job('fresh3_base',3517,0,3,f'{{"at":1,"who":[0,1,2],{FZ}}}')
job('bothfar',3517,2,0,f'{{{A},"plus":2,"who":[0,1],{FZ}}}')
job('three_twofar',3517,3,0,f'{{{A},"plus":2,"who":[0,1],{FZ}}}')
job('four_all_sw3',3517,4,0,f'{{{A},"plus":2,"who":[0,1,2,3],{SW3}}}')
job('four_all_sw3_h26',3517,4,0,f'{{"at":26,"who":[0,1,2,3],{SW3}}}')
job('six_all_far',3517,6,0,f'{{{A},"plus":2,"who":[0,1,2,3,4,5],{FZ}}}')
job('four_two_far',3517,4,0,f'{{{A},"plus":2,"who":[0,1],{FZ}}}')
job('aboard_alone',3517,2,0,f'{{{A},"plus":2,"who":[0],{FZ}}}')
job('back',3517,2,0,f'{{{A},"plus":2,"who":[0],{FZ}}},{{{A},"plus":26,"who":[0],{SH}}}')
job('four_hourly',3517,4,0,','.join(f'{{{A},"plus":{2+i},"who":[{i}],{FZ}}}' for i in range(4)))
job('there_and_back_samehour',3517,2,0,f'{{{A},"plus":2,"who":[0,1],{FZ}}},{{{A},"plus":2,"who":[0,1],{SH}}}')
# run 40's seeds
for sd in (14003,14011,13001):
    job(f'steal_freshfuzhou_{sd}',sd,2,1,f'{{{A},"plus":2,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}}')
# new attacks on R29b (the ship sails to the other port with the one aboard)
job('steal_cancelfresh',3517,2,1,f'{{{A},"plus":2,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}},{{{A},"plus":8,"who":[2],{TOK}}}')
job('steal_recall_d1',3517,2,1,f'{{{A},"plus":2,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}},{{{A},"plus":26,"who":[0,1],{SH}}}')
job('steal_recall_h4',3517,2,1,f'{{{A},"plus":2,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}},{{{A},"plus":4,"who":[0,1],{SH}}}')
job('steal_reclick',3517,2,1,f'{{{A},"plus":2,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}},{{{A},"plus":8,"who":[0,1],{FZ}}}')
job('steal_then_sw3',3517,2,1,f'{{{A},"plus":2,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}},{{{A},"plus":30,"who":[0,1,2],{SW3}}}')
job('steal_one',3517,2,1,f'{{{A},"plus":2,"who":[2],{FZ}}},{{{A},"plus":2,"who":[0],{FZ}}}')
job('steal_noescort',3517,2,1,f'{{{A},"plus":2,"who":[2],{FZ},"escort":false}},{{{A},"plus":2,"who":[0,1],{FZ},"escort":false}}')
job('steal_fresh2',3517,2,2,f'{{{A},"plus":2,"who":[2,3],{FZ}}},{{{A},"plus":2,"who":[0,1],{FZ}}}')
job('steal_four',3517,4,1,f'{{{A},"plus":2,"who":[4],{FZ}}},{{{A},"plus":2,"who":[0,1,2,3],{FZ}}}')
open('c43_jobsK.txt','w',newline='\n').write('\n'.join(J)+'\n')
print(len(J))
