-- Heirloom Prompts: 100 Questions across 10 Categories
-- Replace existing prompts with the full questionnaire

-- Clear existing prompts
DELETE FROM prompts;

-- Insert all 100 prompts
INSERT INTO prompts (text, category) VALUES
-- Early Life & Family Background (1-10)
('When and where were you born?', 'early_life'),
('What is your full name, and is there a story behind it?', 'early_life'),
('What were your parents'' names, and what were they like?', 'early_life'),
('Did you have any siblings? What was your relationship like with them?', 'early_life'),
('What are some of your earliest childhood memories?', 'early_life'),
('What was your childhood home like?', 'early_life'),
('What were some traditions your family had when you were young?', 'early_life'),
('How would you describe your neighborhood growing up?', 'early_life'),
('What kind of values did your parents instill in you?', 'early_life'),
('Who was your most significant influence as a child, and why?', 'early_life'),

-- School Years & Growing Up (11-20)
('Where did you go to school?', 'school_years'),
('What subjects or activities did you enjoy the most?', 'school_years'),
('Did you have a favorite teacher or mentor? Why?', 'school_years'),
('What were some challenges you faced in school?', 'school_years'),
('How did you spend your free time as a child and teenager?', 'school_years'),
('Who was your best friend growing up, and what adventures did you have together?', 'school_years'),
('What was your first job, and how did it shape you?', 'school_years'),
('How did your childhood dreams compare to the path your life actually took?', 'school_years'),
('Were there any world events that shaped your youth?', 'school_years'),
('What advice would you give to your younger self?', 'school_years'),

-- Young Adulthood & Finding Purpose (21-30)
('What did you want to be when you grew up?', 'young_adulthood'),
('Did you go to college, trade school, or join the workforce? Why?', 'young_adulthood'),
('What was your first major challenge as an adult?', 'young_adulthood'),
('How did you navigate your early adult years?', 'young_adulthood'),
('Were there any moments when you felt lost or unsure of your path?', 'young_adulthood'),
('What was the most exciting adventure of your youth?', 'young_adulthood'),
('What was your first major success?', 'young_adulthood'),
('Did you serve in the military or experience a significant historical event firsthand?', 'young_adulthood'),
('How did you meet your spouse or first love?', 'young_adulthood'),
('What advice would you give about finding a life partner?', 'young_adulthood'),

-- Marriage, Family & Relationships (31-40)
('How did you know your spouse was "the one"?', 'relationships'),
('What do you remember most about your wedding day?', 'relationships'),
('What was the biggest lesson marriage taught you?', 'relationships'),
('How did becoming a parent change you?', 'relationships'),
('What were your hopes and dreams for your children?', 'relationships'),
('How did you navigate the challenges of parenthood?', 'relationships'),
('What''s a favorite memory with your children?', 'relationships'),
('How did you balance work, family, and personal life?', 'relationships'),
('What family traditions did you cherish the most?', 'relationships'),
('If you could give one piece of advice to young parents today, what would it be?', 'relationships'),

-- Career & Life's Work (41-50)
('What career path did you take, and why?', 'career'),
('What was your proudest professional accomplishment?', 'career'),
('Did you ever have a moment when you wanted to give up?', 'career'),
('How did you overcome obstacles in your work?', 'career'),
('What was the hardest decision you ever had to make?', 'career'),
('If you could do one thing differently in your career, what would it be?', 'career'),
('Who were your biggest mentors or inspirations in your field?', 'career'),
('What legacy do you hope your work leaves behind?', 'career'),
('How do you want to be remembered by colleagues?', 'career'),
('What was the most fulfilling part of your work life?', 'career'),

-- Biggest Challenges & Lessons Learned (51-60)
('What was the hardest moment of your life?', 'challenges'),
('How did you handle grief or loss?', 'challenges'),
('Was there ever a moment when you questioned your faith or purpose?', 'challenges'),
('What was your most painful memory?', 'challenges'),
('How did you find the strength to move forward in tough times?', 'challenges'),
('Who or what helped you the most in times of struggle?', 'challenges'),
('If you could go back and change one thing about your life, what would it be?', 'challenges'),
('How do you define resilience?', 'challenges'),
('What was the biggest lesson you learned through hardship?', 'challenges'),
('What advice would you give to your grandchildren about facing difficult times?', 'challenges'),

-- Personal Growth & Identity (61-70)
('How do you think you''ve changed over the years?', 'personal_growth'),
('What are you most proud of about who you have become?', 'personal_growth'),
('How did your faith or spirituality evolve throughout your life?', 'personal_growth'),
('What role did forgiveness play in your journey?', 'personal_growth'),
('What personal values have remained most important to you?', 'personal_growth'),
('If you could sum up your life''s philosophy in one sentence, what would it be?', 'personal_growth'),
('What book, movie, or experience influenced you the most?', 'personal_growth'),
('How do you want people to remember your character?', 'personal_growth'),
('If you could talk to your younger self, what would you say?', 'personal_growth'),
('What do you think is the secret to a meaningful life?', 'personal_growth'),

-- Family, Legacy & the Future (71-80)
('What is one thing you hope your grandchildren will always remember about you?', 'legacy'),
('What traditions or values do you hope they carry on?', 'legacy'),
('If they could learn one lesson from your life, what should it be?', 'legacy'),
('What do you want your family to know about love and relationships?', 'legacy'),
('How do you define success and fulfillment?', 'legacy'),
('What are your thoughts on how the world has changed?', 'legacy'),
('What advice would you give to the next generation about navigating life?', 'legacy'),
('What are your greatest hopes for your family''s future?', 'legacy'),
('If you could leave behind one message for the world, what would it be?', 'legacy'),
('What do you want written on your tombstone or remembered in your eulogy?', 'legacy'),

-- Reflections on Happiness & Gratitude (81-90)
('What was the happiest day of your life?', 'gratitude'),
('What is your favorite memory of laughter and joy?', 'gratitude'),
('Who has made the biggest positive impact on your life?', 'gratitude'),
('What are you most grateful for?', 'gratitude'),
('How has gratitude shaped your perspective?', 'gratitude'),
('What''s one small moment in life that turned out to be hugely significant?', 'gratitude'),
('What brings you the most peace?', 'gratitude'),
('How do you want to be celebrated when you pass?', 'gratitude'),
('What is your definition of a well-lived life?', 'gratitude'),
('What does love mean to you?', 'gratitude'),

-- Final Thoughts & Messages to Loved Ones (91-100)
('If you could give your children one final piece of advice, what would it be?', 'final_thoughts'),
('What words of wisdom do you want to pass on to future generations?', 'final_thoughts'),
('How would you like to be remembered?', 'final_thoughts'),
('Is there a specific story you want to be told about your life?', 'final_thoughts'),
('What would you say to those you love most if this were your last conversation?', 'final_thoughts'),
('If you could have one more conversation with someone who has passed, who would it be and what would you say?', 'final_thoughts'),
('What do you believe happens after this life?', 'final_thoughts'),
('How do you want your story to continue through your family?', 'final_thoughts'),
('If you could live one day over again, which day would it be and why?', 'final_thoughts'),
('What final message would you like to leave for your grandchildren?', 'final_thoughts');
