
#                                       ####### MEGA REWARDS #######

# Description:

This contract introduces a novel way to distribute digital assets (STX, NFT and Token) as rewards
among people participating in any kind of competitive events. This could be a hackathon or any kind
of event, where the participants are evaluated and receive grades assigned to them. The rewards are
automatically distributed to the participants in proportion to the grades achieved.

In common competitive setups (for instance a hackathon), only 3 people (first, second and third
place) are rewarded. They receive a share of the available funds. All other participants basically get
nothing even though they might have spent as much energy. In my view, this is not very fair.


# The innovation:

This contract proposes a novel (and in my view fairer) way to distribute the available funds (STX and
SIP010 Token) among participants. It requires every participant to be evaluated and graded using
school grades (A, B, C, D).

The contract introduces the use of a distribution key, which allows the automatic calculation of the
shares of each participant according to their grades. The proposed distribution key in the current
version is (8 – 4 – 2 – 1) which means that the available funds will automatically be divided in such a
way that:

     The grade A participants will receive at least twice the share of the grade B participants
     The grade B participants will receive at least twice the share of the grade C participants
     The grade C participants will receive at least twice the share of the grade D participants
     Since there are no decimal points in integer division, a small remainder will most
        likely remain after the available funds have been divided into the different shares.
        This small remainder will be assigned to one of the grade A participants (ideally
        randomly chosen).

Additionally each participant will receive an NFT according to the grade achieved:
     MegaRewards-GRADE-A-NFT for the grade A participants
     MegaRewards-GRADE-B-NFT for the grade B participants
     MegaRewards-GRADE-C-NFT for the grade C participants
     MegaRewards-GRADE-D-NFT for the grade D participants



# Advantages of using this contract - possible use cases

1. In competition set up (e.g. Hackathon)

The use of this contract incentivizes all the participants in the contest. Therefore it can raise the
interest of more people, motivate a higher number of participants and thus creating a bigger and
stronger community. People who have good ideas but doubt they can make it to the third place
would nevertheless participate because their contribution of ideas would not be in vain, they would
in fact be rewarded.
Even though there is the risk of malicious people submitting very low level work just get the
minimum reward of grade D, this risk can be avoided by just rejecting every low level works which
are not worth evaluating.


2. In an educational set up (e.g.: Schools, Training, Universities)

By making use of this contract, an automatic incentive program called Mega Rewards Program will be
set up to provide digital assets (STX, NFT and Token ) as rewards to students for achieving good grades.

Schools can subscribe to the Mega Rewards program, which automatically rewards student by
sending them STX and other digital assets (NFT and Token) based on the grades they achieve. This
would motivate all students to learn even better. This program could even replace some scholarship
programs.

Teachers usually grade student’s works using the grades (A, B, C, D and F). The contract could be
used to incentives students by rewarding passing grades, and thus motivating them to write even
better grades.


- The scenario is as follows:
Each month anyone who would like to motivate students to learn better and achieve better grades
could send a donation to the contact. This could be parents, educators, Scholarship institutions,
philanthropists, foundations (like the stacks foundation).

Every school or educational institute, which decides to participate in the program would provide a
list of evaluators who will be whitelisted in the contract.

The Evaluators will then register the students with passing grades (laureates) and provide the grades
achieved after each test and assignment.

At the end of the month the available funds will be distributed to the registered laureates, each
laureate receiving his calculated share based on the grade achieved.

During some conversations with students, they confirmed that they would be delighted to participate
in the Mega Rewards program… This would make school more fun :).



# Positive effects of using this contract:

The program motivates more people to participate in competitions (like hackathons)

While rewarding the good work of students the program initiates them into earning crypto assets
while learning.

The program motivates students to learn more and achieve better grades.

The program helps spread the word about Web 3, the Crypto space and particularly stacks.

The program promotes stacks among a wide audience of youth and therefore has the potential of
extending the community.

The program will require all participants to install the hiro wallet. The number of installations can be
significant, if many educational institutions subscribe.
This would increase the number of people participating in the stacks ecosystem.



# Further planned developments:

1. Flexible definition of the distribution key
The current version of the contract has the distribution key (8 – 4 – 2 – 1) which is hard coded into
the function “compute-shares”. Following versions will provide the possibility for the contract owner
to define other distribution keys, to cater to different situations. E.g. (10 – 3 – 2 – 1).

2. Design of the NFTs used in the contract:
The current version of the contract uses 4 NFTs. The design of these NFTs will follow soon.

3. Front End development:
A front end will be developed to provide a user friendly interface for:
- sponsors to fund the contract
- the contract owner to whitelist the evaluators
- the contract owner to set the distribution key
- the evaluators to register laureates
- anyone to view the current stats of the contract
