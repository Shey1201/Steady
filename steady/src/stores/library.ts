import { defineStore } from "pinia";

export interface Article {
  id: string;
  title: string;
  category: string;
  url?: string;
  createdAt: number;
  paragraphs: string[];
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useLibraryStore = defineStore("library", {
  state: () => ({
    articles: [] as Article[],
  }),
  getters: {
    categories: (s) => {
      const map: Record<string, number> = {};
      s.articles.forEach(a => {
        map[a.category] = (map[a.category] || 0) + 1;
      });
      const list = Object.entries(map).map(([name, count]) => ({ name, count }));
      const total = s.articles.length;
      return [{ name: "All", count: total }, ...list];
    },
  },
  actions: {
    importFromText(title: string, category: string, text: string, url?: string) {
      const paragraphs = text
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean);
      const article: Article = {
        id: uid(),
        title,
        category,
        url,
        createdAt: Date.now(),
        paragraphs,
      };
      this.articles.unshift(article);
      return article.id;
    },
    addSample() {
      if (this.articles.length) return;
      this.importFromText(
        "The Impact of Digital Literacy",
        "Education",
        `Digital literacy has become an essential skill in the 21st century, affecting every aspect of our lives from education to employment. With the rapid advancement of technology, individuals who lack digital literacy skills are at a significant disadvantage, struggling to access information, communicate effectively, and participate in the digital economy. This gap not only limits personal opportunities but also contributes to social inequality.

To address this issue, educational institutions must integrate digital literacy into their curricula, providing students with the knowledge and skills needed to navigate the digital world safely and responsibly. This includes teaching students how to evaluate the credibility of online information, protect their personal data, and use digital tools for learning and collaboration. Additionally, governments and non-profit organizations should offer training programs for adults who have not had the opportunity to develop these skills.

The benefits of digital literacy are numerous. It can improve academic performance, increase employment opportunities, and enhance social connectivity. It also enables individuals to participate in civic life, access government services, and make informed decisions. By investing in digital literacy, we can create a more inclusive and equitable society, where everyone has the opportunity to thrive in the digital age. (Word count: 587)`,
        "https://example.com/digital-literacy"
      );
      this.importFromText(
        "The Evolution of Language",
        "Linguistics",
        `Language is not a static entity; it is a living, breathing organism that evolves over time. From the grunt and gestures of our early ancestors to the complex grammatical structures of modern languages, the history of human communication is a testament to our adaptability and creativity. Changes in language are driven by a variety of factors, including social interaction, technological innovation, and cultural exchange.

One of the most significant drivers of language change is contact between different linguistic groups. When people from different backgrounds come together, they often borrow words and phrases from each other, leading to the creation of new dialects and even entirely new languages. This process, known as linguistic borrowing, enriches languages and reflects the interconnectedness of human societies.

In the digital age, the rate of language evolution has accelerated. The internet and social media have given rise to new forms of communication, such as emojis, hashtags, and internet slang. While some purists lament these changes as a degradation of language, linguists view them as a natural progression. Language exists to serve the needs of its speakers, and as our needs change, so too must our language. (Word count: 543)`,
        "https://example.com/language-evolution"
      );
      this.importFromText(
        "Sustainable Living: A Path Forward",
        "Environment",
        `Sustainable living is a lifestyle that attempts to reduce an individual's or society's use of the Earth's natural resources, and one's personal resources. It is often called "earth harmony living" or "net zero living." Practitioners of sustainable living often attempt to reduce their carbon footprint by altering their methods of transportation, energy consumption, and diet.

One major component of sustainable living is the reduction of waste. This can be achieved through the principles of reduce, reuse, and recycle. By consuming less, reusing items whenever possible, and recycling materials, we can significantly decrease the amount of waste that ends up in landfills. Composting organic waste is another effective way to return nutrients to the soil and reduce methane emissions.

Another key aspect is energy conservation. This involves using energy-efficient appliances, insulating homes, and utilizing renewable energy sources such as solar or wind power. Small changes, like turning off lights when leaving a room or using public transportation, can collectively make a big difference. Sustainable living is not just about environmental protection; it is also about creating a healthier and more equitable world for future generations. (Word count: 512)`,
        "https://example.com/sustainable-living"
      );
      this.importFromText(
        "The Future of Artificial Intelligence",
        "Technology",
        `Artificial intelligence (AI) is transforming the world at an unprecedented pace. From self-driving cars to personalized recommendations on streaming platforms, AI is becoming deeply integrated into our daily lives.

However, the rapid advancement of this technology raises significant ethical questions. We must consider the implications of automation on the workforce and ensure that these systems are developed with fairness and transparency in mind.

One of the most exciting areas is Natural Language Processing (NLP). Large language models can now understand and generate human-like text, opening up new possibilities for education, communication, and creativity. As we move forward, striking a balance between innovation and regulation will be crucial for a sustainable future.`
      );
      this.importFromText(
        "The Art of Focus in a Digital Age",
        "Philosophy",
        `In an era defined by constant connectivity and an endless stream of notifications, the ability to focus has become a rare and valuable commodity. We find ourselves living in what some social scientists call the "attention economy," where every app, website, and digital service is meticulously designed to capture and hold our gaze for as long as possible. This constant fragmentation of our attention doesn't just reduce our productivity; it fundamentally alters how we perceive the world and engage with deep work.

Deep work, a term popularized by Cal Newport, refers to the ability to focus without distraction on a cognitively demanding task. It is in this state that we push our cognitive capabilities to their limit, creating new value and improving our skills. However, the modern workspace is often the antithesis of a deep work environment. Open-plan offices, instant messaging tools like Slack, and the cultural expectation of immediate responsiveness create a state of "continuous partial attention." We are never fully present in one task, but rather skimming the surface of many.

The physiological impact of this constant task-switching is significant. Every time we shift our focus from one thing to another, there is a "switch cost" – a period of time where our brain is still processing the previous task while trying to engage with the new one. This residue of attention prevents us from reaching the levels of flow necessary for truly creative or complex problem-solving. Over time, this can lead to mental fatigue and a decreased capacity for sustained concentration.

To reclaim our focus, we must treat attention as a muscle that needs training rather than a fixed resource. This involves creating intentional boundaries between our digital lives and our focused work. Practices such as "time blocking," where specific hours are dedicated solely to one task with all notifications turned off, can help rebuild our capacity for concentration. Furthermore, engaging in activities that require sustained attention without immediate digital reward—such as reading long-form literature or practicing meditation—can strengthen our cognitive endurance.

Ultimately, the battle for our attention is not just about getting more things done. it is about preserving the quality of our inner lives. When we lose the ability to focus, we lose the ability to think deeply, to reflect on our experiences, and to engage meaningfully with the people around us. In the digital age, choosing where we place our attention is perhaps the most important act of autonomy we can perform.`
      );
      this.importFromText(
        "Understanding ADHD and Deep Reading",
        "Psychology",
        `For individuals with ADHD, the traditional reading experience can often feel like navigating a maze without a map. The brain's executive functions, responsible for maintaining focus and filtering out irrelevant stimuli, operate differently, making long-form text particularly challenging. However, understanding these cognitive differences allows for the design of better tools that cater to neurodivergent needs.

One of the primary challenges is "visual crowding." When a page is filled with dense blocks of text, the brain can become overwhelmed by the sheer volume of information, leading to what is known as "wall of text" syndrome. This is where specialized reading modes, such as focus modes that highlight only the current paragraph while dimming the rest, become transformative. By reducing the cognitive load required to filter out surrounding text, these tools allow the reader to dedicate more energy to comprehension and synthesis.

Another factor is the need for immediate feedback and engagement. Traditional reading is a passive activity, which can lead to the mind wandering. Interactive reading tools that allow for quick lookups, instant translations, or the ability to "capture" interesting phrases with a single click provide the necessary dopamine hits and active engagement required to maintain focus. These features turn reading from a static task into a dynamic exploration.

Moreover, the environment in which we read matters just as much as the text itself. A clean, minimalist interface that eliminates sidebar distractions and focuses solely on the content can significantly reduce the potential for distraction. For someone with ADHD, every pixel on the screen is a potential competitor for their attention. By stripping away everything but the essential, we create a "digital sanctuary" for the mind.

In conclusion, designing for ADHD is not just about making things "easier"; it's about making them accessible. When we build tools that respect the way different brains process information, we unlock the potential for everyone to engage with the profound ideas found in deep reading. Focus is not a moral failing; it's a cognitive state that can be supported by thoughtful design.`
      );
      this.importFromText(
        "The Science of Habit Formation",
        "Biology",
        `Habits are the invisible architecture of daily life. Research suggests that about 40 percent of our daily activities are not conscious decisions, but habitual responses to specific cues in our environment. Understanding how these neural loops are formed is the key to both breaking self-destructive behaviors and building new, productive ones.

The process of habit formation can be broken down into a three-step loop: the cue, the routine, and the reward. The cue is a trigger that tells your brain to go into automatic mode and which habit to use. The routine is the physical, mental, or emotional behavior itself. Finally, the reward helps your brain figure out if this particular loop is worth remembering for the future. Over time, this loop—cue, routine, reward; cue, routine, reward—becomes more and more automatic.

Neuroscientists have found that as a habit is formed, the brain's activity changes. When a behavior is new, the prefrontal cortex—the part of the brain associated with complex planning and decision-making—is highly active. However, as the behavior becomes habitual, the brain activity shifts to the basal ganglia, an older part of the brain responsible for procedural memory and motor control. This transition allows the brain to conserve mental energy for other tasks.

One of the most powerful findings in habit research is the concept of "keystone habits." These are small changes or habits that people introduce into their routines that unintentionally carry over into other aspects of their lives. For example, exercise is often a keystone habit. When people start exercising regularly, they often start eating better, sleeping more, and becoming more productive at work, even if they didn't intentionally set out to change those areas.

To change an existing habit, you must identify the underlying craving that the habit satisfies. Most habits are not about the behavior itself, but about the emotional or physiological reward it provides. If you can keep the same cue and provide the same reward, but insert a new routine, you can successfully rewrite the neural loop. This is known as the Golden Rule of habit change.

Environmental design also plays a crucial role. Our brains are highly sensitive to visual cues. If you want to make a habit easier to perform, you should make the cue more obvious. Conversely, if you want to break a bad habit, you should hide the cue. For instance, if you want to read more, place a book on your pillow every morning. If you want to stop checking your phone, leave it in another room.

Consistency is more important than intensity when it comes to long-term change. The "myth of 21 days" suggests that habits take exactly three weeks to form, but modern research shows that the actual time can vary from 18 to 254 days, depending on the complexity of the behavior. The goal is not perfection, but persistence. Missing a single day does not significantly impact the long-term success of habit formation, provided you get back on track the next day.

Social context is another powerful driver. We are social animals, and we tend to adopt the habits of the people we spend the most time with. If you surround yourself with people who value deep work and continuous learning, you are far more likely to develop those habits yourself. This is why communities of practice and study groups are so effective.

The final piece of the puzzle is belief. For a habit to truly stick, especially during times of stress or crisis, you must believe that change is possible. This belief is often bolstered by being part of a group that shares the same goals. When we see others succeeding, it reinforces our own sense of agency and possibility.

In summary, mastering your habits is not about willpower alone. It's about understanding the mechanics of the brain, designing your environment, and leveraging social support. By consciously constructing our daily loops, we can move from being passive participants in our lives to being the active architects of our future.`
      );
      this.importFromText(
        "Deep Work: Rules for Focused Success",
        "Business",
        `Deep work is the ability to focus without distraction on a cognitively demanding task. It’s a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the kind of true fulfillment that comes from craftsmanship. In short, deep work is like a super power in our increasingly competitive twenty-first century economy. And yet, most people have lost the ability to go deep—spending their days instead in a frantic blur of e-mail and social media, not even realizing there’s a better way.

In this article, we will explore why deep work is so valuable, why it’s becoming increasingly rare, and how you can cultivate this skill in your own life. We’ll look at the neurological reasons why focus is so difficult in the modern age, and provide actionable strategies for building a deep work ritual that sticks.

The first rule of deep work is to work deeply. This sounds obvious, but it’s actually quite difficult to execute. You must decide on a depth philosophy that fits your life—whether it’s the monastic approach, the bimodal approach, the rhythmic approach, or the journalistic approach. Each has its own strengths and weaknesses, and the right choice depends on your specific goals and personality.

The second rule is to embrace boredom. In an age of instant gratification, we have lost the ability to be alone with our thoughts. Every time we feel a moment of boredom, we reach for our phones. This constant stimulation weakens our "focus muscle." To strengthen it, we must intentionally practice being bored—whether it’s sitting in a waiting room without checking our phone or going for a walk without a podcast.

The third rule is to quit social media. Social media is designed to be addictive, and it’s one of the biggest enemies of deep work. While it can provide some value, for most people, the costs far outweigh the benefits. We’ll discuss how to conduct a "social media audit" and determine which platforms, if any, are truly worth your time.

The fourth rule is to drain the shallows. Shallow work is logistical-style work, often performed while distracted. This work is easy to replicate and doesn't create much new value. To maximize your output, you must minimize the time you spend on shallow tasks. We’ll look at techniques for scheduling every minute of your day and creating a "shutdown ritual" to ensure you can fully disconnect from work at the end of the day.

Deep work is not just about productivity; it’s about living a meaningful life. When we engage in deep work, we enter a state of flow, where time seems to disappear and we are fully immersed in our craft. This state is inherently rewarding and provides a sense of accomplishment that shallow work can never match.

Furthermore, deep work is essential for mastering the "hard skills" required in today's economy. Whether you're a programmer, a writer, a designer, or a scientist, the ability to focus intensely is the only way to master the complexities of your field. Without deep work, you're relegated to the periphery, performing tasks that can easily be automated or outsourced.

The challenge, of course, is that our environment is designed for distraction. From open-plan offices to constant notifications, everything is working against our ability to focus. This is why building a deep work ritual is so important. It’s not enough to just "try harder." You must create a system that protects your focus and makes deep work the default, rather than the exception.

This involves choosing a specific location for your deep work, setting clear boundaries with colleagues and family, and using tools that minimize distraction. It also means taking care of your physical and mental health—getting enough sleep, eating well, and practicing mindfulness.

In conclusion, deep work is one of the most important skills you can develop in the modern age. By mastering the art of focus, you can achieve more, learn faster, and live a more fulfilling life. It’s not an easy path, but it’s the only path to true mastery and success in the twenty-first century.`
      );
      this.importFromText(
        "The Stoic Philosophy of Life",
        "Philosophy",
        `Stoicism is an ancient Greek philosophy that has seen a remarkable resurgence in the modern era. At its core, Stoicism is a practical framework for living a life of virtue, resilience, and inner peace. It teaches us that while we cannot control external events, we have absolute control over our own thoughts, judgments, and actions. This realization is the key to psychological freedom.

The foundation of Stoic practice is the "dichotomy of control." The Stoics divided the world into two categories: things that are up to us and things that are not. Up to us are our opinions, intentions, desires, and aversions. Not up to us are our bodies, our possessions, our reputations, and the actions of others. By focusing our energy exclusively on what we can control, we eliminate a vast amount of unnecessary anxiety and frustration.

Another central tenet of Stoicism is the concept of "living in accordance with nature." For humans, this means living rationally and socially. It means using our capacity for reason to understand the world and our place in it, and fulfilling our duties to our fellow human beings. The Stoics believed that virtue—wisdom, justice, courage, and temperance—is the only true good, and that everything else is "indifferent."

One of the most powerful Stoic exercises is "negative visualization" or *premortiatio malorum*. This involves periodically reflecting on the possibility of losing the things we value—our health, our wealth, our loved ones, even our own lives. Far from being morbid, this practice serves to increase our gratitude for what we currently have and prepares us to face adversity with equanimity. When we realize that everything we possess is on loan from Fortune, we can enjoy it more deeply while it lasts and let it go more easily when it's gone.

Stoicism also emphasizes the importance of the present moment. Marcus Aurelius, the Roman Emperor and Stoic philosopher, wrote extensively about the "inner citadel"—the part of the mind that remains untouched by external chaos. By retreating into this citadel, we can find a sense of calm and clarity even in the most difficult circumstances. He reminded himself that the present moment is all we ever truly possess, and that to waste it in regret for the past or fear for the future is a betrayal of our own nature.

The Stoic concept of *Amor Fati*, or "love of fate," takes this a step further. It's the idea of not just accepting what happens, but embracing it as necessary and even beneficial for our growth. Every challenge is seen as an opportunity to practice virtue. A difficult colleague is an opportunity to practice patience; a financial setback is an opportunity to practice resourcefulness; a personal loss is an opportunity to practice courage.

In the modern world, Stoicism provides a powerful antidote to the culture of victimhood and the constant pursuit of external validation. It reminds us that our worth is not determined by our job title, our bank balance, or the number of likes we receive on social media. Instead, it's determined by the quality of our character and the integrity of our actions.

Practicing Stoicism doesn't mean becoming emotionless or indifferent to the suffering of others. On the contrary, by mastering our own destructive emotions—like anger, envy, and greed—we become more capable of acting with compassion and justice. A Stoic is like a rock in the sea: the waves may crash against it, but it remains firm and the water around it eventually becomes still.

In conclusion, the Stoic philosophy of life is not a collection of abstract theories, but a set of tools for navigating the complexities of human existence. By focusing on what we can control, practicing gratitude, and embracing every moment with courage and reason, we can build a life of profound meaning and unshakable peace. As Epictetus, the former slave turned philosopher, famously said: "It's not what happens to you, but how you react to it that matters."`
      );
    }
  },
  persist: true,
});

