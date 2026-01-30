import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { ExercisePlan, Exercise } from './ExercisePlans';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isQuickAction?: boolean;
  actions?: string[];
}

interface ChatbotProps {
  userName: string;
  onPlanCreated: (plan: ExercisePlan) => void;
}

type ConversationStage = 'welcome' | 'goal' | 'level' | 'duration' | 'focus' | 'generating' | 'complete';

export function Chatbot({ userName, onPlanCreated }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${userName}! 👋 I'm your personal fitness coach. I'll create a customized workout plan just for you! Let's get started - what's your main fitness goal?`,
      sender: 'bot',
      timestamp: new Date(),
      isQuickAction: true,
      actions: ['Build Muscle', 'Lose Weight', 'Improve Endurance', 'General Fitness']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [conversationStage, setConversationStage] = useState<ConversationStage>('welcome');
  const [userProfile, setUserProfile] = useState({
    goal: '',
    level: '',
    duration: '',
    focus: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generatePersonalizedPlan = (): ExercisePlan => {
    const planId = Date.now().toString();
    
    // Generate exercises based on user profile
    const exercises: Exercise[] = [];
    
    if (userProfile.goal === 'Build Muscle' || userProfile.goal === 'General Fitness') {
      exercises.push(
        {
          id: `${planId}-1`,
          name: 'Push-ups',
          sets: userProfile.level === 'Beginner' ? 3 : 4,
          reps: userProfile.level === 'Beginner' ? '8-10' : '12-15',
          calories: 50,
          description: 'A classic upper body exercise that targets chest, shoulders, and triceps.',
          instructions: [
            'Start in a plank position with hands shoulder-width apart',
            'Lower your body until chest nearly touches the floor',
            'Push back up to starting position',
            'Keep your core engaged throughout the movement'
          ],
          tips: [
            'Keep your body in a straight line',
            'Don\'t let your hips sag',
            'Breathe out as you push up'
          ]
        },
        {
          id: `${planId}-2`,
          name: 'Squats',
          sets: userProfile.level === 'Beginner' ? 3 : 4,
          reps: userProfile.level === 'Beginner' ? '10-12' : '15-20',
          calories: 80,
          description: 'A fundamental lower body exercise that works quads, glutes, and hamstrings.',
          instructions: [
            'Stand with feet shoulder-width apart',
            'Lower your body by bending knees and hips',
            'Keep chest up and back straight',
            'Push through heels to return to starting position'
          ],
          tips: [
            'Keep knees aligned with toes',
            'Go as low as comfortable',
            'Engage your core for stability'
          ]
        }
      );
    }
    
    if (userProfile.goal === 'Lose Weight' || userProfile.goal === 'Improve Endurance') {
      exercises.push(
        {
          id: `${planId}-3`,
          name: 'Burpees',
          sets: userProfile.level === 'Beginner' ? 3 : 4,
          reps: userProfile.level === 'Beginner' ? '6-8' : '10-12',
          calories: 110,
          description: 'A full-body cardio exercise that combines strength and endurance.',
          instructions: [
            'Start standing, drop into a squat',
            'Place hands on ground and jump feet back into plank',
            'Do a push-up (optional)',
            'Jump feet back to squat position',
            'Explode up into a jump'
          ],
          tips: [
            'Land softly to protect joints',
            'Modify by stepping instead of jumping',
            'Maintain steady breathing'
          ]
        },
        {
          id: `${planId}-4`,
          name: 'Mountain Climbers',
          sets: 3,
          reps: userProfile.level === 'Beginner' ? '10 each leg' : '15 each leg',
          calories: 80,
          description: 'A cardio exercise that also works your core and upper body.',
          instructions: [
            'Start in plank position',
            'Drive one knee toward chest',
            'Quickly switch legs',
            'Continue alternating at a fast pace'
          ],
          tips: [
            'Keep hips level',
            'Don\'t bounce',
            'Maintain plank form'
          ]
        }
      );
    }
    
    // Add core exercises
    exercises.push(
      {
        id: `${planId}-5`,
        name: 'Plank',
        sets: 3,
        reps: userProfile.level === 'Beginner' ? '20-30 sec' : '45-60 sec',
        duration: userProfile.level === 'Beginner' ? '25 sec' : '50 sec',
        calories: 40,
        description: 'An isometric core exercise that builds overall stability and strength.',
        instructions: [
          'Start in a forearm plank position',
          'Keep body in a straight line from head to heels',
          'Hold the position without letting hips sag',
          'Breathe steadily throughout'
        ],
        tips: [
          'Don\'t hold your breath',
          'Squeeze your glutes',
          'Keep your neck neutral'
        ]
      }
    );
    
    if (userProfile.focus === 'Upper Body' || userProfile.focus === 'Full Body') {
      exercises.push({
        id: `${planId}-6`,
        name: 'Dumbbell Rows',
        sets: 3,
        reps: userProfile.level === 'Beginner' ? '8-10' : '12-15',
        calories: 60,
        description: 'A pulling exercise that targets back muscles and biceps.',
        instructions: [
          'Bend forward with one hand on bench',
          'Hold dumbbell in other hand',
          'Pull weight to ribcage, keeping elbow close',
          'Lower with control and repeat'
        ],
        tips: [
          'Keep back flat',
          'Pull with your back, not just arms',
          'Don\'t rotate your torso'
        ]
      });
    }
    
    if (userProfile.focus === 'Lower Body' || userProfile.focus === 'Full Body') {
      exercises.push({
        id: `${planId}-7`,
        name: 'Lunges',
        sets: 3,
        reps: userProfile.level === 'Beginner' ? '8 each leg' : '12 each leg',
        calories: 70,
        description: 'A unilateral lower body exercise that improves balance and leg strength.',
        instructions: [
          'Step forward with one leg',
          'Lower your hips until both knees are bent at 90 degrees',
          'Push back to starting position',
          'Alternate legs'
        ],
        tips: [
          'Keep front knee behind toes',
          'Maintain upright posture',
          'Engage core for balance'
        ]
      });
    }
    
    if (userProfile.focus === 'Core') {
      exercises.push(
        {
          id: `${planId}-8`,
          name: 'Russian Twists',
          sets: 3,
          reps: userProfile.level === 'Beginner' ? '10 each side' : '15 each side',
          calories: 60,
          description: 'A rotational exercise that strengthens obliques and improves core stability.',
          instructions: [
            'Sit with knees bent and feet off ground',
            'Lean back slightly',
            'Rotate torso to touch hands to ground on each side',
            'Keep core engaged throughout'
          ],
          tips: [
            'Move with control',
            'Keep chest up',
            'Breathe steadily'
          ]
        },
        {
          id: `${planId}-9`,
          name: 'Bicycle Crunches',
          sets: 3,
          reps: userProfile.level === 'Beginner' ? '12' : '20',
          calories: 50,
          description: 'A dynamic ab exercise that targets obliques and rectus abdominis.',
          instructions: [
            'Lie on back with hands behind head',
            'Bring one knee toward chest while rotating torso',
            'Touch opposite elbow to knee',
            'Alternate sides in a pedaling motion'
          ],
          tips: [
            'Don\'t pull on neck',
            'Focus on rotation',
            'Keep lower back pressed down'
          ]
        }
      );
    }

    const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);
    
    return {
      id: planId,
      name: `${userProfile.goal} Plan - ${userProfile.focus}`,
      duration: userProfile.duration,
      difficulty: userProfile.level as 'Beginner' | 'Intermediate' | 'Advanced',
      totalCalories,
      exercises
    };
  };

  const handleBotResponse = (userMessage: string) => {
    let botResponse = '';
    let nextStage: ConversationStage = conversationStage;
    let quickActions: string[] | undefined;

    switch (conversationStage) {
      case 'welcome':
        // User provided their goal
        setUserProfile(prev => ({ ...prev, goal: userMessage }));
        botResponse = "Great choice! What's your current fitness level?";
        quickActions = ['Beginner', 'Intermediate', 'Advanced'];
        nextStage = 'goal';
        break;

      case 'goal':
        // User provided their level
        setUserProfile(prev => ({ ...prev, level: userMessage }));
        botResponse = "Perfect! How much time can you dedicate per workout session?";
        quickActions = ['15-20 min', '30-45 min', '45-60 min', '60+ min'];
        nextStage = 'level';
        break;

      case 'level':
        // User provided duration
        setUserProfile(prev => ({ ...prev, duration: userMessage }));
        botResponse = "Excellent! What area would you like to focus on?";
        quickActions = ['Full Body', 'Upper Body', 'Lower Body', 'Core'];
        nextStage = 'duration';
        break;

      case 'duration':
        // User provided focus area
        setUserProfile(prev => ({ ...prev, focus: userMessage }));
        botResponse = "Awesome! 🎉 Let me create your personalized workout plan...";
        nextStage = 'generating';
        
        // Generate plan after a delay
        setTimeout(() => {
          const newPlan = generatePersonalizedPlan();
          onPlanCreated(newPlan);
          
          const completionMessage: Message = {
            id: Date.now().toString(),
            text: `✨ Your personalized plan is ready! I've created "${newPlan.name}" with ${newPlan.exercises.length} exercises tailored to your goals.\n\nYour plan includes:\n${newPlan.exercises.map((ex, i) => `${i + 1}. ${ex.name} - ${ex.sets} sets × ${ex.reps}`).join('\n')}\n\n🔥 Total calories: ${newPlan.totalCalories}\n⏱️ Duration: ${newPlan.duration}\n\nClick "My Plans" in the header to view details and start your workout!\n\nWould you like me to create another plan or do you have any questions?`,
            sender: 'bot',
            timestamp: new Date(),
            isQuickAction: true,
            actions: ['Create Another Plan', 'I have a question']
          };
          
          setMessages(prev => [...prev, completionMessage]);
          setConversationStage('complete');
        }, 1500);
        break;

      case 'complete':
        if (userMessage.toLowerCase().includes('another') || userMessage.toLowerCase().includes('new plan')) {
          setUserProfile({ goal: '', level: '', duration: '', focus: '' });
          botResponse = "Great! Let's create a new plan. What's your fitness goal this time?";
          quickActions = ['Build Muscle', 'Lose Weight', 'Improve Endurance', 'General Fitness'];
          nextStage = 'welcome';
        } else if (userMessage.toLowerCase().includes('question')) {
          botResponse = "Of course! I'm here to help. What would you like to know about your workout plan, exercises, or fitness in general?";
          nextStage = 'complete';
        } else {
          // General questions in complete stage
          const lowerMessage = userMessage.toLowerCase();
          if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food')) {
            botResponse = "Great question about nutrition! Here are my top tips:\n\n• Eat protein after workouts (chicken, fish, eggs, or plant-based)\n• Stay hydrated - drink water throughout the day\n• Include vegetables with every meal\n• Avoid processed foods and excess sugar\n• Time your meals - eat 1-2 hours before workouts\n\nWould you like more specific nutrition advice?";
          } else if (lowerMessage.includes('rest') || lowerMessage.includes('recovery')) {
            botResponse = "Recovery is crucial! Here's what I recommend:\n\n• Get 7-9 hours of sleep\n• Take 1-2 rest days per week\n• Stretch after workouts\n• Stay hydrated\n• Consider light activities like walking on rest days\n\nYour muscles grow during rest, not during workouts!";
          } else if (lowerMessage.includes('motivation') || lowerMessage.includes('inspire')) {
            botResponse = "You've got this! 💪 Remember:\n\n• Progress over perfection\n• Every workout counts\n• You're stronger than you think\n• Results take time - stay consistent\n• The hardest part is showing up\n\nYou're already ahead by taking action. Keep going!";
          } else {
            botResponse = "That's a great question! I can help you with:\n\n• Creating new workout plans\n• Exercise form and technique\n• Nutrition and diet advice\n• Rest and recovery tips\n• Motivation and mindset\n\nWhat would you like to know more about?";
          }
          nextStage = 'complete';
        }
        break;
    }

    if (botResponse) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        isQuickAction: !!quickActions,
        actions: quickActions
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setConversationStage(nextStage);
      }, 500);
    }
  };

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    handleBotResponse(textToSend);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <Bot className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold">FitPro AI Coach</h3>
          <p className="text-sm text-indigo-100">Your personalized fitness assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 shadow-md'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            {message.sender === 'bot' && message.isQuickAction && message.actions && (
              <div className="flex flex-wrap gap-2 mt-3 ml-2">
                {message.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-colors text-sm font-medium shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={() => handleSendMessage()}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}