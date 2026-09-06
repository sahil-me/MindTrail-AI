import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is MindTrail AI?',
    answer:
      'MindTrail AI is a private AI-powered journal designed to help you capture meaningful moments, reflect on your thoughts, and rediscover patterns across your personal memories.',
  },
  {
    question: 'Is my journal private?',
    answer:
      'Your journal entries are associated with your authenticated account and isolated from other users. MindTrail is designed so your personal reflections remain within your own account.',
  },
  {
    question: 'Can I ask questions about my memories?',
    answer:
      'Yes. Ask My Memories lets you have AI-powered conversations about relevant reflections you have saved in your personal journal.',
  },
  {
    question: 'How does MindTrail use AI?',
    answer:
      'MindTrail uses Gemini to help with thoughtful conversations, reflection, summaries, questions, and insights based on the information available within your personal journal experience.',
  },
  {
    question: 'What can I save in MindTrail?',
    answer:
      'You can save personal reflections, meaningful moments, thoughts, experiences, and other memories you want to revisit over time.',
  },
  {
    question: 'What is the Memory Timeline?',
    answer:
      'The Memory Timeline organizes your saved reflections chronologically, giving you a visual way to revisit your personal journey.',
  },
  {
    question: 'What is AI Weekly Reflection?',
    answer:
      'AI Weekly Reflection helps you step back and explore recurring themes, patterns, and meaningful observations from your recent reflections.',
  },
  {
    question: 'Which sign-in methods are supported?',
    answer:
      'MindTrail supports Google Sign-In and secure email/password authentication.',
  },
  {
    question: 'What is Reflective Reading?',
    answer:
      'Reflective Reading suggests curated literature and books matching the themes and personal growth patterns in your reflections to enrich your reading journey.',
  },
  {
    question: 'How is my data separated from other users?',
    answer:
      'MindTrail associates journal data with your authenticated account and uses user-specific data boundaries so one user\'s reflections are not presented as another user\'s memories.',
  },
];

interface FAQSectionProps {
  id?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ id = 'faq-section' }) => {
  // The first FAQ question must be open by default
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <section
      id={id}
      aria-labelledby="faq-main-heading"
      className="w-full py-6 sm:py-10 space-y-10 sm:space-y-12 scroll-mt-24"
    >
      {/* Header Container */}
      <div className="max-w-3xl text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6ED] dark:bg-[#201D17] border border-[#E8DFC9] dark:border-[#383222] text-[#7C8B7A] dark:text-[#8FA08E] text-xs font-semibold tracking-wider uppercase">
          <HelpCircle className="w-3.5 h-3.5 text-[#8C743D] dark:text-[#D4B774]" />
          <span>FAQ & GUIDE</span>
        </div>

        <h2
          id="faq-main-heading"
          className="font-serif-title text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight leading-[1.2]"
        >
          Questions? We've got answers.
        </h2>

        <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl font-normal">
          Learn how MindTrail works, how your memories are stored, and how AI helps you reflect on your personal journey.
        </p>
      </div>

      {/* Accordion Container */}
      <div
        id="faq-accordion-container"
        className="w-full max-w-4xl space-y-3.5 sm:space-y-4"
        role="region"
        aria-label="Frequently Asked Questions"
      >
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              id={`faq-card-${index}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-[#FFFDF8] dark:bg-[#1E1C1A] border-[#D4C3A3] dark:border-[#3E372A] shadow-xs'
                  : 'bg-[#FAF7F0]/70 dark:bg-[#181715]/60 border-[#E8E2D5] dark:border-[#282622] hover:bg-[#FFFDF8] dark:hover:bg-[#1C1A18] hover:border-[#DDD5C5] dark:hover:border-[#36322A]'
              }`}
            >
              <button
                type="button"
                id={`btn-faq-toggle-${index}`}
                onClick={() => toggleFAQ(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-panel-${index}`}
                className="w-full text-left px-5 sm:px-7 py-4.5 sm:py-5 flex items-center justify-between gap-4 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs transition-colors ${
                      isOpen
                        ? 'text-[#8C743D] dark:text-[#D4B774] font-semibold'
                        : 'text-[#8C8B83] dark:text-[#7A7872] group-hover:text-[#52504B] dark:group-hover:text-[#A8A59C]'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-serif-title text-base sm:text-lg lg:text-[19px] leading-snug transition-colors ${
                      isOpen
                        ? 'text-[#171817] dark:text-[#F6F4EE] font-medium'
                        : 'text-[#2C2A26] dark:text-[#E2DFD7] group-hover:text-[#171817] dark:group-hover:text-[#F6F4EE]'
                    }`}
                  >
                    {item.question}
                  </span>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isOpen
                      ? 'bg-[#F2ECE0] dark:bg-[#292621] text-[#8C743D] dark:text-[#D4B774]'
                      : 'bg-transparent text-[#8C8B83] dark:text-[#7A7872] group-hover:text-[#171817] dark:group-hover:text-[#F6F4EE]'
                  }`}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible Answer Panel */}
              <div
                id={`faq-answer-panel-${index}`}
                role="region"
                aria-labelledby={`btn-faq-toggle-${index}`}
                className={`transition-all duration-200 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <div className="px-5 sm:px-7 pb-5 sm:pb-6 pt-1 sm:pt-2 border-t border-[#F2ECE0]/70 dark:border-[#292621]/80">
                  <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed font-normal pl-7 sm:pl-8">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
