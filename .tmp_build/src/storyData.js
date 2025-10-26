"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyActs = void 0;
// Act 1 Events (from act1_events.json)
const act1Events = [
    {
        id: "act1_tutorial_welcome",
        title: "Welcome, Young Disciple",
        description: "An elder steps forward to guide you through the basics: meditate to gather Qi, train to improve your techniques, and try a simple skirmish.",
        choices: [
            { id: "start_tutorial", text: "Begin the tutorial", consequences: {} }
        ],
        executorId: "fn_act1_tutorial_welcome"
    },
    {
        id: "act1_tutorial_meditation",
        title: "First Meditation",
        description: "Sit and gather your Qi. This meditation guarantees a small cultivation gain and introduces the meditation action.",
        choices: [
            { id: "meditate_now", text: "Meditate", consequences: {} }
        ],
        executorId: "fn_act1_first_meditation"
    },
    {
        id: "act1_tutorial_skirmish",
        title: "Target Practice",
        description: "Face a weak spirit wolf to learn basic combat controls. This encounter is scripted to be winnable and grants a small item reward.",
        choices: [
            { id: "fight", text: "Fight", consequences: {} }
        ],
        executorId: "fn_act1_combat_intro"
    },
    {
        id: "act1_cultivation_awakening",
        title: "Cultivation Awakening",
        description: "Your innate talent for cultivation awakens, revealing your potential.",
        choices: [
            { id: "embrace", text: "Embrace your cultivation path", consequences: {} },
            { id: "hesitate", text: "Hesitate and observe first", consequences: {} }
        ],
        executorId: "fn_act1_cultivation_awakening"
    },
    {
        id: "act1_first_meditation",
        title: "First Meditation",
        description: "You attempt your first meditation session to gather spiritual energy.",
        choices: [
            { id: "focus", text: "Focus deeply", consequences: {} },
            { id: "distracted", text: "Get distracted", consequences: {} }
        ],
        executorId: "fn_act1_first_meditation"
    },
    {
        id: "act1_sect_entrance",
        title: "Sect Entrance",
        description: "You arrive at a cultivation sect seeking to join as a disciple.",
        choices: [
            { id: "impress", text: "Try to impress elders", consequences: {} },
            { id: "humble", text: "Approach humbly", consequences: {} }
        ],
        executorId: "fn_act1_sect_entrance"
    },
    {
        id: "act1_spirit_stone",
        title: "Spirit Stone Discovery",
        description: "You discover a spirit stone that can aid your cultivation.",
        choices: [
            { id: "absorb", text: "Absorb its energy", consequences: {} },
            { id: "save", text: "Save for later", consequences: {} }
        ],
        executorId: "fn_act1_spirit_stone"
    },
    {
        id: "act1_martial_test",
        title: "Martial Test",
        description: "The sect tests your martial abilities and combat potential.",
        choices: [
            { id: "aggressive", text: "Fight aggressively", consequences: {} },
            { id: "defensive", text: "Focus on defense", consequences: {} }
        ],
        executorId: "fn_act1_martial_test"
    },
    {
        id: "act1_elder_attention",
        title: "Elder's Attention",
        description: "A sect elder notices your potential and offers guidance.",
        choices: [
            { id: "accept", text: "Accept guidance", consequences: {} },
            { id: "decline", text: "Decline politely", consequences: {} }
        ],
        executorId: "fn_act1_elder_attention"
    },
    {
        id: "act1_rival_appears",
        title: "Rival Appears",
        description: "A fellow disciple becomes your rival, pushing you to improve.",
        choices: [
            { id: "challenge", text: "Challenge them", consequences: {} },
            { id: "ignore", text: "Ignore them", consequences: {} }
        ],
        executorId: "fn_act1_rival_appears"
    },
    {
        id: "act1_first_mission",
        title: "First Mission",
        description: "The sect assigns you your first mission to prove yourself.",
        choices: [
            { id: "brave", text: "Charge ahead bravely", consequences: {} },
            { id: "cautious", text: "Proceed cautiously", consequences: {} }
        ],
        executorId: "fn_act1_first_mission"
    },
    {
        id: "act1_herbal_discovery",
        title: "Herbal Discovery",
        description: "You find rare medicinal herbs that can enhance cultivation.",
        choices: [
            { id: "consume", text: "Consume immediately", consequences: {} },
            { id: "alchemy", text: "Save for alchemy", consequences: {} }
        ],
        executorId: "fn_act1_herbal_discovery"
    },
    {
        id: "act1_breakthrough_attempt",
        title: "Breakthrough Attempt",
        description: "You attempt to break through to the next cultivation realm.",
        choices: [
            { id: "force", text: "Force breakthrough", consequences: {} },
            { id: "patient", text: "Wait patiently", consequences: {} }
        ],
        executorId: "fn_act1_breakthrough_attempt"
    },
    {
        id: "act1_sect_tournament",
        title: "Sect Tournament",
        description: "The sect holds a tournament for disciples to showcase skills.",
        choices: [
            { id: "participate", text: "Participate fully", consequences: {} },
            { id: "observe", text: "Observe only", consequences: {} }
        ],
        executorId: "fn_act1_sect_tournament"
    },
    {
        id: "act1_ancient_manual",
        title: "Ancient Manual",
        description: "You discover an ancient cultivation manual with powerful techniques.",
        choices: [
            { id: "study", text: "Study deeply", consequences: {} },
            { id: "share", text: "Share with sect", consequences: {} }
        ],
        executorId: "fn_act1_ancient_manual"
    },
    {
        id: "act1_spirit_beast",
        title: "Spirit Beast Encounter",
        description: "You encounter a spirit beast that could be friend or foe.",
        choices: [
            { id: "befriend", text: "Try to befriend", consequences: {} },
            { id: "fight", text: "Prepare to fight", consequences: {} }
        ],
        executorId: "fn_act1_spirit_beast"
    },
    {
        id: "act1_qi_control",
        title: "Qi Control Practice",
        description: "You practice controlling your spiritual energy for the first time.",
        choices: [
            { id: "precise", text: "Focus on precision", consequences: {} },
            { id: "power", text: "Focus on power", consequences: {} }
        ],
        executorId: "fn_act1_qi_control"
    },
    {
        id: "act1_sect_politics",
        title: "Sect Politics",
        description: "You become aware of political tensions within the sect.",
        choices: [
            { id: "involve", text: "Get involved", consequences: {} },
            { id: "avoid", text: "Avoid politics", consequences: {} }
        ],
        executorId: "fn_act1_sect_politics"
    },
    {
        id: "act1_first_alchemy",
        title: "First Alchemy Attempt",
        description: "You attempt your first alchemical concoction.",
        choices: [
            { id: "careful", text: "Proceed carefully", consequences: {} },
            { id: "bold", text: "Experiment boldly", consequences: {} }
        ],
        executorId: "fn_act1_first_alchemy"
    },
    {
        id: "act1_night_cultivation",
        title: "Night Cultivation",
        description: "You practice cultivation under the moonlight for enhanced effects.",
        choices: [
            { id: "continue", text: "Cultivate all night", consequences: {} },
            { id: "rest", text: "Get some rest", consequences: {} }
        ],
        executorId: "fn_act1_night_cultivation"
    },
    {
        id: "act1_mentor_choice",
        title: "Mentor Choice",
        description: "You must choose a cultivation mentor from available elders.",
        choices: [
            { id: "strict", text: "Choose strict mentor", consequences: {} },
            { id: "kind", text: "Choose kind mentor", consequences: {} }
        ],
        executorId: "fn_act1_mentor_choice"
    },
    {
        id: "act1_sect_favor",
        title: "Sect Favor",
        description: "A senior disciple asks for your help with a personal matter.",
        choices: [
            { id: "help", text: "Help them", consequences: {} },
            { id: "refuse", text: "Politely refuse", consequences: {} }
        ],
        executorId: "fn_act1_sect_favor"
    },
    {
        id: "act1_dream_revelation",
        title: "Dream Revelation",
        description: "You have a prophetic dream about your cultivation future.",
        choices: [
            { id: "believe", text: "Believe the dream", consequences: {} },
            { id: "dismiss", text: "Dismiss as fantasy", consequences: {} }
        ],
        executorId: "fn_act1_dream_revelation"
    },
    {
        id: "act1_body_tempering",
        title: "Body Tempering",
        description: "You begin the painful process of tempering your physical body.",
        choices: [
            { id: "endure", text: "Endure the pain", consequences: {} },
            { id: "stop", text: "Stop and rest", consequences: {} }
        ],
        executorId: "fn_act1_body_tempering"
    },
    {
        id: "act1_spiritual_sense",
        title: "Spiritual Sense Awakening",
        description: "Your spiritual sense awakens, allowing you to perceive energy.",
        choices: [
            { id: "expand", text: "Expand your sense", consequences: {} },
            { id: "focus", text: "Focus narrowly", consequences: {} }
        ],
        executorId: "fn_act1_spiritual_sense"
    },
    {
        id: "act1_sect_library",
        title: "Sect Library Discovery",
        description: "You discover hidden knowledge in the sect's ancient library.",
        choices: [
            { id: "study", text: "Study intensely", consequences: {} },
            { id: "report", text: "Report to elders", consequences: {} }
        ],
        executorId: "fn_act1_sect_library"
    },
    {
        id: "act1_first_artifact",
        title: "First Artifact",
        description: "You acquire your first cultivation artifact or weapon.",
        choices: [
            { id: "bond", text: "Bond with it", consequences: {} },
            { id: "study", text: "Study it first", consequences: {} }
        ],
        executorId: "fn_act1_first_artifact"
    },
    {
        id: "act1_weather_phenomenon",
        title: "Weather Phenomenon",
        description: "A strange weather phenomenon affects cultivation energy in the area.",
        choices: [
            { id: "cultivate", text: "Cultivate during it", consequences: {} },
            { id: "avoid", text: "Avoid the anomaly", consequences: {} }
        ],
        executorId: "fn_act1_weather_phenomenon"
    },
    {
        id: "act1_sect_elixir",
        title: "Sect Elixir Distribution",
        description: "The sect distributes cultivation elixirs to promising disciples.",
        choices: [
            { id: "request", text: "Request elixir", consequences: {} },
            { id: "modest", text: "Be modest", consequences: {} }
        ],
        executorId: "fn_act1_sect_elixir"
    },
    {
        id: "act1_mountain_training",
        title: "Mountain Training",
        description: "You undertake rigorous training on a sacred mountain.",
        choices: [
            { id: "push", text: "Push to limits", consequences: {} },
            { id: "steady", text: "Train steadily", consequences: {} }
        ],
        executorId: "fn_act1_mountain_training"
    },
    {
        id: "act1_spirit_spring",
        title: "Spirit Spring Discovery",
        description: "You discover a spirit spring with enhanced cultivation energy.",
        choices: [
            { id: "bathe", text: "Bathe in it", consequences: {} },
            { id: "protect", text: "Protect the secret", consequences: {} }
        ],
        executorId: "fn_act1_spirit_spring"
    },
    {
        id: "act1_dao_insight",
        title: "Dao Insight",
        description: "You experience a moment of profound insight into the Dao.",
        choices: [
            { id: "meditate", text: "Meditate on it", consequences: {} },
            { id: "share", text: "Share with mentor", consequences: {} }
        ],
        executorId: "fn_act1_dao_insight"
    },
    {
        id: "act1_sect_crisis",
        title: "Sect Crisis",
        description: "A crisis threatens the sect, testing disciples' loyalty.",
        choices: [
            { id: "defend", text: "Defend the sect", consequences: {} },
            { id: "flee", text: "Consider fleeing", consequences: {} }
        ],
        executorId: "fn_act1_sect_crisis"
    },
    {
        id: "act1_final_test",
        title: "Final Disciple Test",
        description: "The sect administers the final test to become a full disciple.",
        choices: [
            { id: "confident", text: "Face confidently", consequences: {} },
            { id: "nervous", text: "Approach nervously", consequences: {} }
        ],
        executorId: "fn_act1_final_test"
    },
    {
        id: "act1_orphan_on_street",
        title: "Orphan on the Street",
        description: "You find a crying orphan being bullied in the marketplace. Their sect token glimmers faintly on their clothes.",
        conditions: { level: 1 },
        choices: [
            { id: "help", text: "Stand up for them", consequences: {} },
            { id: "ignore", text: "Keep walking; better not get involved", consequences: {} }
        ],
        executorId: "fn_act1_orphan_on_street"
    },
    {
        id: "act1_azure_recruiting_post",
        title: "Recruiting Post from Azure Cloud Sect",
        description: "A loud speaker proclaims that Azure Cloud Sect seeks outer disciples. The banner promises food, shelter, and training (plus one goat).",
        conditions: { level: 1, flags: { joined_sect: false } },
        choices: [
            { id: "apply_now", text: "Join Azure Cloud Sect now", consequences: {} },
            { id: "compare_other_sects", text: "Wait to see what other sects offer", consequences: {} }
        ],
        executorId: "fn_act1_azure_recruiting_post"
    },
    {
        id: "act1_sword_school_demo",
        title: "Sword School Demo",
        description: "Huashan Sword School sends a junior disciple to your village to demonstrate sword-techniques. The show is impressive — though the demonstration ends with accidentally slicing a cart.",
        conditions: { level: 2 },
        choices: [
            { id: "ask_to_train", text: "Request to become a student", consequences: {} },
            { id: "laugh_then_leave", text: "Laugh at the mishap and leave", consequences: {} }
        ],
        executorId: "fn_act1_sword_school_demo"
    },
    {
        id: "act1_ming_cult_shadow_mission",
        title: "Shadow of the Ming Cult",
        description: "You overhear that the Ming Cult is planning a secret midnight gathering. The locals whisper of dark arts and stolen relics.",
        conditions: { level: 2, sect: "any" },
        choices: [
            { id: "sneak_in", text: "Sneak in to investigate", consequences: {} },
            { id: "report_to_sect", text: "Tell whatever sect you belong to", consequences: {} }
        ],
        executorId: "fn_act1_ming_cult_shadow_mission"
    },
    {
        id: "act1_shaolin_monk_request",
        title: "A Monk's Request",
        description: "A Shaolin monk comes by asking for help to deliver medicine to a remote hamlet plagued by ghosts/night creatures.",
        conditions: { level: 1 },
        choices: [
            { id: "help", text: "Escort the monk", consequences: {} },
            { id: "decline", text: "Too dangerous; stay in town", consequences: {} }
        ],
        executorId: "fn_act1_shaolin_monk_request"
    },
    {
        id: "act1_serendipitous_mentor",
        title: "Serendipitous Mentor",
        description: "You accidentally help an elderly cultivator carry wood. He reveals himself as an Emei Sect senior and offers to teach you.",
        conditions: { level: 1, flags: { joined_sect: false } },
        choices: [
            { id: "accept", text: "Take his offer", consequences: {} },
            { id: "decline", text: "Polite, but you wish to find your own path", consequences: {} }
        ],
        executorId: "fn_act1_serendipitous_mentor"
    },
    {
        id: "act1_monster_attack_tavern",
        title: "Monster Attack at the Tavern",
        description: "A beast bursts through the shuttered window of the tavern where you're drinking tea. Patrons scream and duck.",
        conditions: { level: 2 },
        choices: [
            { id: "fight", text: "Draw your weapon and protect them", consequences: {} },
            { id: "hide", text: "Slip out backdoor unseen", consequences: {} }
        ],
        executorId: "fn_act1_monster_attack_tavern"
    },
    {
        id: "act1_training_with_canes",
        title: "Training with Canes",
        description: "An old beggar shows you how to do staff work using a cane. It's rusty, squeaky, and perhaps more comedic than useful—but there's value in humility.",
        conditions: { level: 1 },
        choices: [
            { id: "train_humbly", text: "Follow his instruction", consequences: {} },
            { id: "mock_and_leave", text: "Mock the old cane, move on", consequences: {} }
        ],
        executorId: "fn_act1_training_with_canes"
    },
    {
        id: "act1_spirit_beast_egg",
        title: "Spirit Beast Egg",
        description: "You find a strange egg glowing with qi under a tree. It hatches quickly, a tiny spirit beast, barely bigger than your palm, chirps at you.",
        conditions: { level: 1 },
        choices: [
            { id: "keep_it", text: "Try raising it", consequences: {} },
            { id: "sell_it", text: "Take it to the market", consequences: {} }
        ],
        executorId: "fn_act1_spirit_beast_egg"
    },
    {
        id: "act1_old_scroll_snatchers",
        title: "Old Scroll Snatchers",
        description: "Bandits try to steal an ancient cultivation scroll from a wandering scholar.",
        conditions: { level: 2 },
        choices: [
            { id: "defend", text: "Protect the scholar", consequences: {} },
            { id: "steal_for_gain", text: "Side with bandits for reward", consequences: {} }
        ],
        executorId: "fn_act1_old_scroll_snatchers"
    },
    {
        id: "act1_first_rival_encounter",
        title: "First Rival Encounter",
        description: "You bump into another young aspirant practicing forms at dawn. They challenge you to a spar to test whose qigong is stronger.",
        conditions: { level: 2 },
        choices: [
            { id: "accept", text: "Spar with them", consequences: {} },
            { id: "avoid", text: "Avoid conflict", consequences: {} }
        ],
        executorId: "fn_act1_first_rival_encounter"
    },
    {
        id: "act1_sect_test_visit",
        title: "Sect Entry Test",
        description: "You're invited to take the entry test of a sect. It involves a riddle and balancing qi while carrying water.",
        conditions: { level: 2, flags: { joined_sect: false } },
        choices: [
            { id: "do_best", text: "Focus fully", consequences: {} },
            { id: "trick_test", text: "Attempt to cheat or sneak past difficulty", consequences: {} }
        ],
        executorId: "fn_act1_sect_test_visit"
    },
    {
        id: "act1_wanshou_valley_guided_tour",
        title: "Guided Tour of Wanshou Valley",
        description: "Disciples from Wanshou Valley offer a tour of their valley's flora, fauna, and hidden cultivation springs. It ends with a comedic slip into a hot spring.",
        conditions: { level: 1, flags: { joined_sect: false } },
        choices: [
            { id: "join_the_valley", text: "Ask to join Wanshou Valley", consequences: {} },
            { id: "leave_amused", text: "Leave, soaking wet but amused", consequences: {} }
        ],
        executorId: "fn_act1_wanshou_valley_guided_tour"
    },
    {
        id: "act1_tavern_drinking_contest",
        title: "Tavern Drinking Contest",
        description: "A local drunkard challenges you to a qi-powered drinking game: each cup of tea enhances qi flow… or gastrointestinal distress.",
        conditions: { level: 1 },
        choices: [
            { id: "drink", text: "Accept the contest", consequences: {} },
            { id: "politely_refuse", text: "Decline with manners", consequences: {} }
        ],
        executorId: "fn_act1_tavern_drinking_contest"
    },
    {
        id: "act1_secret_sword_blade",
        title: "Secret Sword Blade",
        description: "You hear rumors of a hidden sword blade in a ruined temple once used by the Sword Sect of Mount Shu.",
        conditions: { level: 2 },
        choices: [
            { id: "seek_blade", text: "Go look for it", consequences: {} },
            { id: "ignore_rumor", text: "Dismiss it as myth", consequences: {} }
        ],
        executorId: "fn_act1_secret_sword_blade"
    },
    {
        id: "act1_mystic_herb_gathering",
        title: "Mystic Herb Gathering",
        description: "Your sect (if you have one) asks you to gather rare herbs in nearby woods. Some beasts guard them; some herbs are surprisingly lewd in their form.",
        conditions: { level: 2, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "brave_through", text: "Push through danger", consequences: {} },
            { id: "ask_for_help", text: "Bring someone along", consequences: {} }
        ],
        executorId: "fn_act1_mystic_herb_gathering"
    },
    {
        id: "act1_unexpected_duel_challenge",
        title: "Unexpected Duel Challenge",
        description: "During sect drills, another disciple insults your technique. They challenge you to duel at dawn.",
        conditions: { level: 2, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "accept_duel", text: "Train and fight", consequences: {} },
            { id: "seek_mediation", text: "Ask elders to intervene", consequences: {} }
        ],
        executorId: "fn_act1_unexpected_duel_challenge"
    },
    {
        id: "act1_tag_along_mission",
        title: "Tag-Along Mission",
        description: "Your sect elder is going out to subdue a small demon beast and lets you accompany — mostly to fetch water, but you see everything.",
        conditions: { level: 2, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "observe", text: "Stay back and observe closely", consequences: {} },
            { id: "help", text: "Ask to help despite protests", consequences: {} }
        ],
        executorId: "fn_act1_tag_along_mission"
    },
    {
        id: "act1_mortal_world_festival",
        title: "Mortal World Festival",
        description: "A lantern festival in town; folk tell tales of immortals and legendary beasts over food and firecrackers.",
        conditions: { level: 1 },
        choices: [
            { id: "listen_to_stories", text: "Sit and listen", consequences: {} },
            { id: "participate", text: "Join in the games", consequences: {} }
        ],
        executorId: "fn_act1_mortal_world_festival"
    },
    {
        id: "act1_shady_talisman_vendor",
        title: "Shady Talisman Vendor",
        description: "A wandering vendor claims a talisman can protect from curses — costlier than gold, guaranteed or your head back.",
        conditions: { level: 1 },
        choices: [
            { id: "buy", text: "Buy the talisman", consequences: {} },
            { id: "decline", text: "Decline; seems fishy", consequences: {} }
        ],
        executorId: "fn_act1_shady_talisman_vendor"
    },
    {
        id: "act1_breakfast_with_elder",
        title: "Breakfast with Elder",
        description: "An elder in your sect invites you for breakfast — simple congee, pickles, and a rare teaching snippet about qi circulation.",
        conditions: { level: 1, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "ask_questions", text: "Ask many questions", consequences: {} },
            { id: "eat_quietly", text: "Respectfully eat and listen", consequences: {} }
        ],
        executorId: "fn_act1_breakfast_with_elder"
    },
    {
        id: "act1_mistaken_identity_novice",
        title: "Mistaken Identity Novice",
        description: "Another outer disciple mistakes you for a famous cultivator's son/daughter and demands deference.",
        conditions: { level: 1, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "go_along", text: "Pretend to be them, enjoy the perks", consequences: {} },
            { id: "correct", text: "Tell the truth", consequences: {} }
        ],
        executorId: "fn_act1_mistaken_identity_novice"
    },
    {
        id: "act1_cultivation_trial_sleep_deprived",
        title: "Cultivation Trial: Sleep-Deprived",
        description: "Your sect imposes a night trial: you must maintain Qi focus through the night without rest. The elders sleep, you don't.",
        conditions: { level: 2, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "push_on", text: "Endure the trial", consequences: {} },
            { id: "collapse", text: "Admit defeat and rest", consequences: {} }
        ],
        executorId: "fn_act1_cultivation_trial_sleep_deprived"
    },
    {
        id: "act1_mystic_dream_visit",
        title: "Mystic Dream Visit",
        description: "In your sleep, a spirit appears and offers cryptic advice — possibly helpful, possibly misleading.",
        conditions: { level: 1 },
        choices: [
            { id: "heed", text: "Follow the advice", consequences: {} },
            { id: "dismiss", text: "Ignore the dream", consequences: {} }
        ],
        executorId: "fn_act1_mystic_dream_visit"
    },
    {
        id: "act1_sell_tea_for_training",
        title: "Sell Tea for Training Funds",
        description: "You consider selling handmade tea to raise funds for better instruction tools or gear.",
        conditions: { level: 1, flags: { joined_sect: false } },
        choices: [
            { id: "do_it", text: "Try selling", consequences: {} },
            { id: "seek_alternative", text: "Ask sect for help", consequences: {} }
        ],
        executorId: "fn_act1_sell_tea_for_training"
    },
    {
        id: "act1_stowaway_on_merchant_caravan",
        title: "Stowaway on a Merchant Caravan",
        description: "You sneak onto a caravan heading toward the mountains where many sects are located. Risky, but adventurous.",
        conditions: { level: 1, flags: { joined_sect: false } },
        choices: [
            { id: "stay_hidden", text: "Try to remain unnoticed", consequences: {} },
            { id: "reveal_self", text: "Reveal yourself and ask for passage", consequences: {} }
        ],
        executorId: "fn_act1_stowaway_on_merchant_caravan"
    },
    {
        id: "act1_acrobatic_wuxia_show",
        title: "Acrobatic Wuxia Show",
        description: "Travelling performers from Sword Sect of Mount Shu display aerial sword forms. You are invited to join after a mistake in their act.",
        conditions: { level: 1 },
        choices: [
            { id: "join_act", text: "Join their act for fun", consequences: {} },
            { id: "decline_gracefully", text: "Step back and watch", consequences: {} }
        ],
        executorId: "fn_act1_acrobatic_wuxia_show"
    },
    {
        id: "act1_compete_for_inner_disciple_slot",
        title: "Compete for Inner Disciple Slot",
        description: "Your sect announces an opening for inner disciple. You must demonstrate loyalty, talent, and stamina.",
        conditions: { level: 2, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "train_hard", text: "Push your limits", consequences: {} },
            { id: "make_deals", text: "Try to curry favor with seniors", consequences: {} }
        ],
        executorId: "fn_act1_compete_for_inner_disciple_slot"
    },
    {
        id: "act1_rival_prank_night",
        title: "Rival Prank at Night",
        description: "A rival disciple sneaks into your quarters and replaces your meditation incense with foul smelling herbs.",
        conditions: { level: 1, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "prank_back", text: "Get even", consequences: {} },
            { id: "report_to_elder", text: "Inform elders", consequences: {} }
        ],
        executorId: "fn_act1_rival_prank_night"
    },
    {
        id: "act1_basic_artifact_discovery",
        title: "Basic Artifact Discovery",
        description: "You uncover an old jade pendant with inscriptions hinting at minor qi‐amplification properties.",
        conditions: { level: 2 },
        choices: [
            { id: "keep_and_study", text: "Study its inscriptions", consequences: {} },
            { id: "sell_to_collector", text: "Sell for money", consequences: {} }
        ],
        executorId: "fn_act1_basic_artifact_discovery"
    },
    {
        id: "act1_food_poisoning_from_medicine",
        title: "Food Poisoning from 'Medicinal' Herbs",
        description: "A mishandled herb leads to stomach cramps. The healer must decide whether it's sect fault or a simple mistake.",
        conditions: { level: 1, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "blame_the_healer", text: "Confront the healer", consequences: {} },
            { id: "forgive", text: "Let it slide and learn", consequences: {} }
        ],
        executorId: "fn_act1_food_poisoning_from_medicine"
    },
    {
        id: "act1_midnight_guard_duty",
        title: "Midnight Guard Duty",
        description: "Your sect assigns you to guard the outer gate at midnight. The wind howls; shadows dance.",
        conditions: { level: 2, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "stay_alert", text: "Stay alert and attentive", consequences: {} },
            { id: "nap", text: "Sneak in a nap", consequences: {} }
        ],
        executorId: "fn_act1_midnight_guard_duty"
    },
    {
        id: "act1_rumor_of_immortal_spot",
        title: "Rumor of an Immortal's Spot",
        description: "They say an immortal sometimes visits an abandoned shrine on a moonlit night, leaving behind potent qi residue.",
        conditions: { level: 2 },
        choices: [
            { id: "stake_out_shrine", text: "Wait for the immortal", consequences: {} },
            { id: "investigate_shrine", text: "Go inside now", consequences: {} }
        ],
        executorId: "fn_act1_rumor_of_immortal_spot"
    },
    {
        id: "act1_scroll_reading_quarrel",
        title: "Scroll Reading Quarrel",
        description: "Another outer disciple steals your reading scroll and begins misinterpreting the techniques in public, causing you embarrassment.",
        conditions: { level: 1, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "correct_publicly", text: "Correct them loudly", consequences: {} },
            { id: "wait_for_privacy", text: "Sneak back the scroll quietly", consequences: {} }
        ],
        executorId: "fn_act1_scroll_reading_quarrel"
    },
    {
        id: "act1_initial_qi_breakthrough_attempt",
        title: "Initial Qi Breakthrough Attempt",
        description: "You feel energy surging in your meridians. You can attempt your first breakthrough — success is unlikely without preparation.",
        conditions: { level: 2, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "attempt_now", text: "Try the breakthrough", consequences: {} },
            { id: "prepare", text: "Gather resources first", consequences: {} }
        ],
        executorId: "fn_act1_initial_qi_breakthrough_attempt"
    },
    {
        id: "act1_mortal_duel_showcase",
        title: "Mortal Duel Showcase",
        description: "In your home province, a martial arts tournament is held. Sect disciples are encouraged to show their skills.",
        conditions: { level: 2, sect: "any", flags: { joined_sect: true } },
        choices: [
            { id: "enter_tournament", text: "Compete", consequences: {} },
            { id: "attend_as_spectator", text: "Watch and learn", consequences: {} }
        ],
        executorId: "fn_act1_mortal_duel_showcase"
    },
    {
        id: "act1_gift_from_family",
        title: "Gift from Family",
        description: "Your family sends a small jade talisman said to be from an ancient immortal's stash.",
        conditions: { level: 1, flags: { joined_sect: true } },
        choices: [
            { id: "treasure_it", text: "Keep and treasure it", consequences: {} }
        ],
        executorId: "fn_act1_gift_from_family"
    }
];
// Act 2 Events (sample from act2_events.json)
const act2Events = [
    {
        id: "act2_sect_joining_ceremony",
        title: "Sect Joining Ceremony",
        description: "You participate in the ceremony to officially join the sect.",
        conditions: { level: 5 },
        choices: [
            { id: "pledge_loyalty", text: "Pledge eternal loyalty", consequences: {} },
            { id: "join_casually", text: "Join without strong commitment", consequences: {} }
        ],
        executorId: "fn_act2_sect_joining_ceremony"
    }
    // TODO: Add more events from act2_events.json
];
// Act 3 Events (sample from act3_events.json)
const act3Events = [
    {
        id: "act3_intra_sect_faction_conflict",
        title: "Intra-Sect Faction Conflict",
        description: "Within your sect, two factions clash over adopting a new teaching. You are asked to take sides.",
        conditions: { level: 10 },
        choices: [
            { id: "side_conservatives", text: "Support the elders", consequences: {} },
            { id: "side_progressives", text: "Back the new teaching", consequences: {} }
        ],
        executorId: "fn_act3_intra_sect_faction_conflict"
    }
    // TODO: Add more events from act3_events.json
];
// Act 4 Events (sample from act4_events.json)
const act4Events = [
// TODO: Add events from act4_events.json
];
exports.storyActs = [
    {
        id: 'act1',
        title: 'The Path Begins',
        description: 'Your journey into the world of cultivation starts here.',
        mainQuests: [
            {
                id: 'first_cultivation',
                title: 'First Steps on the Dao',
                description: 'Begin your cultivation journey by reaching the Qi Gathering realm.',
                status: 'active',
                objectives: [
                    {
                        id: 'reach_qi_gathering',
                        type: 'REACH_REALM',
                        description: 'Reach Qi Gathering realm',
                        target: 'realm',
                        value: 'Qi Gathering',
                        isCompleted: false
                    }
                ]
            },
            {
                id: 'join_sect',
                title: 'Find Your Place',
                description: 'Join a sect to gain access to resources and teachings.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'sect_membership',
                        type: 'HAVE_STAT',
                        description: 'Join any sect',
                        target: 'sect',
                        value: 'any',
                        isCompleted: false
                    }
                ]
            }
        ],
        sideQuests: [
            {
                id: 'first_rival',
                title: 'A Challenger Appears',
                description: 'Defeat your first rival to establish your reputation.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'defeat_first_rival',
                        type: 'DEFEAT_RIVAL',
                        description: 'Defeat any rival',
                        target: 'any',
                        value: 1,
                        isCompleted: false
                    }
                ]
            }
        ],
        events: act1Events,
        unlockConditions: {}
    },
    {
        id: 'act2',
        title: 'Trials of the Sect',
        description: 'Having joined a sect, you must prove your worth and climb the inner ranks.',
        mainQuests: [
            {
                id: 'sect_trials',
                title: 'Prove Your Worth',
                description: 'Complete the sect\'s initiation trials.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'trial_tasks',
                        type: 'COMPLETE_TASKS',
                        description: 'Complete 3 sect tasks',
                        target: 'tasks',
                        value: 3,
                        isCompleted: false
                    }
                ]
            },
            {
                id: 'foundation_prep',
                title: 'Preparing the Foundation',
                description: 'Accumulate resources and insight for Foundation Establishment.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'gather_resources',
                        type: 'GATHER_RESOURCES',
                        description: 'Gather cultivation resources',
                        target: 'resources',
                        value: 100,
                        isCompleted: false
                    }
                ]
            }
        ],
        sideQuests: [
            {
                id: 'rivalry_deepens',
                title: 'Old Rival, New Stakes',
                description: 'Your old rival resurfaces with a challenge.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'challenge_duel',
                        type: 'WIN_DUEL',
                        description: 'Win a duel against your rival',
                        target: 'rival',
                        value: 1,
                        isCompleted: false
                    }
                ]
            }
        ],
        events: act2Events,
        unlockConditions: {
            previousAct: 'act1',
            level: 8,
            realm: 'Qi Gathering'
        }
    },
    {
        id: 'act3',
        title: 'Foundation and Influence',
        description: 'You lay your Foundation and begin to influence the sect and region.',
        mainQuests: [
            {
                id: 'establish_foundation',
                title: 'Foundation Establishment',
                description: 'Reach Foundation Establishment.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'reach_foundation',
                        type: 'REACH_REALM',
                        description: 'Reach Foundation Establishment realm',
                        target: 'realm',
                        value: 'Foundation Establishment',
                        isCompleted: false
                    }
                ]
            },
            {
                id: 'secure_allies',
                title: 'Secure Allies',
                description: 'Forge alliances to prepare for future conflicts.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'ally_count',
                        type: 'GAIN_ALLIES',
                        description: 'Gain 2 allies',
                        target: 'allies',
                        value: 2,
                        isCompleted: false
                    }
                ]
            }
        ],
        sideQuests: [
            {
                id: 'rogue_cultivator',
                title: 'Rogue Cultivator Threat',
                description: 'A rogue cultivator terrorizes nearby villages.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'deal_with_rogue',
                        type: 'DEFEAT_ENEMY',
                        description: 'Defeat the rogue cultivator',
                        target: 'rogue',
                        value: 1,
                        isCompleted: false
                    }
                ]
            }
        ],
        events: act3Events,
        unlockConditions: {
            previousAct: 'act2',
            level: 15,
            realm: 'Foundation Establishment'
        }
    },
    {
        id: 'act4',
        title: 'Core and Conflict',
        description: 'Approach Core Formation as greater conflicts brew in the realm.',
        mainQuests: [
            {
                id: 'form_core',
                title: 'Golden Core',
                description: 'Form your Core to step into true power.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'reach_core',
                        type: 'REACH_REALM',
                        description: 'Reach Core Formation',
                        target: 'realm',
                        value: 'Core Formation',
                        isCompleted: false
                    }
                ]
            },
            {
                id: 'defend_sect',
                title: 'Defend the Sect',
                description: 'An external sect threatens your home—defend it.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'repel_attack',
                        type: 'COMPLETE_MISSION',
                        description: 'Repel the attackers',
                        target: 'missions',
                        value: 1,
                        isCompleted: false
                    }
                ]
            }
        ],
        sideQuests: [
            {
                id: 'ancient_ruins',
                title: 'Secrets of the Ancient Ruins',
                description: 'Explore the ruins rumored to house a legacy technique.',
                status: 'inactive',
                objectives: [
                    {
                        id: 'explore_ruins',
                        type: 'EXPLORE',
                        description: 'Explore the Ancient Ruins',
                        target: 'location',
                        value: 'Ancient Ruins',
                        isCompleted: false
                    }
                ]
            }
        ],
        events: act4Events,
        unlockConditions: {
            previousAct: 'act3',
            level: 25,
            realm: 'Core Formation'
        }
    },
    // Stub Acts 5-7
    {
        id: 'act5',
        title: 'Nascent Soul',
        description: 'Coming soon...',
        mainQuests: [],
        sideQuests: [],
        events: [],
        unlockConditions: { previousAct: 'act4' }
    },
    {
        id: 'act6',
        title: 'Spirit Severing',
        description: 'Coming soon...',
        mainQuests: [],
        sideQuests: [],
        events: [],
        unlockConditions: { previousAct: 'act5' }
    },
    {
        id: 'act7',
        title: 'Dao Seeking',
        description: 'Coming soon...',
        mainQuests: [],
        sideQuests: [],
        events: [],
        unlockConditions: { previousAct: 'act6' }
    }
];
