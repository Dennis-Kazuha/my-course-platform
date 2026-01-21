import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

/**
 * Firebase Seed Script
 * Populates Firestore with initial course data
 *
 * Usage:
 *   npx ts-node scripts/seed-firebase.ts
 *
 * Environment Variables:
 *   FIREBASE_PROJECT_ID - Firebase project ID
 *   FIREBASE_SERVICE_ACCOUNT_KEY - Path to service account JSON file (optional)
 */

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const serviceAccount = serviceAccountKeyPath
    ? JSON.parse(fs.readFileSync(serviceAccountKeyPath, "utf-8"))
    : undefined;

  admin.initializeApp({
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

// ============================================================================
// SEED DATA
// ============================================================================

// TODO: Replace this with your TurboScribe transcript output
const TRANSCRIPT_TEXT = `
Welcome to Achieve More With GenAI. In this course, you'll learn how to leverage generative AI to boost your productivity and achieve more in less time.

Module 1: Understanding Generative AI
Generative AI is a type of artificial intelligence that can create new content based on patterns it has learned from training data. This includes text, images, code, and more.

The key difference between generative AI and traditional machine learning is that generative models can produce entirely new outputs, not just classify or predict existing data.

Common applications include chatbots, content creation, code generation, and creative tools.

Module 2: Getting Started with AI Tools
There are many AI tools available today. Some popular ones include ChatGPT, Claude, Gemini, and Copilot.

Each tool has its own strengths and weaknesses. ChatGPT is great for general-purpose tasks, while specialized tools might be better for specific domains.

To get started, you'll need to create an account on your chosen platform and familiarize yourself with the interface.

Module 3: Prompting Best Practices
The quality of your prompts directly affects the quality of AI outputs. A good prompt is clear, specific, and provides context.

Instead of asking "Write a blog post", try "Write a 500-word blog post about productivity tips for remote workers, targeting beginners".

You should also provide examples of the style or format you want. This helps the AI understand your expectations better.

Module 4: Advanced Techniques
Once you're comfortable with basic prompting, you can explore more advanced techniques like few-shot prompting, chain-of-thought reasoning, and prompt chaining.

Few-shot prompting involves providing examples of the task you want the AI to perform. This significantly improves output quality.

Chain-of-thought reasoning asks the AI to explain its thinking step-by-step, which often leads to better results.

Module 5: Practical Applications
Now let's look at real-world applications. You can use AI to write emails, create social media content, generate code, analyze data, and much more.

The key is to find ways to integrate AI into your existing workflow to save time and increase productivity.

Remember to always review AI-generated content carefully. While AI is powerful, it's not perfect and can sometimes make mistakes.

Conclusion
Generative AI is a powerful tool that can help you achieve more. By understanding how it works and learning best practices, you can leverage it effectively in your work and personal life.

Thank you for taking this course. We hope you found it valuable!
`;

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedFirebase() {
  console.log("🌱 Starting Firebase seed...\n");

  try {
    // Create instructor user
    console.log("📝 Creating instructor user...");
    const instructorRef = await db.collection("users").add({
      openId: "instructor-001",
      name: "GenAI Instructor",
      email: "instructor@genai-course.com",
      loginMethod: "firebase",
      role: "instructor",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    const instructorId = instructorRef.id;
    console.log(`✓ Instructor created: ${instructorId}\n`);

    // Create course
    console.log("📚 Creating course...");
    const courseRef = await db.collection("courses").add({
      title: "Achieve More With GenAI",
      description:
        "Learn how to leverage generative AI to boost your productivity and achieve more in less time. This comprehensive course covers everything from AI fundamentals to advanced prompting techniques and real-world applications.",
      instructorId: instructorId,
      thumbnail: "https://via.placeholder.com/400x300?text=GenAI+Course",
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const courseId = courseRef.id;
    console.log(`✓ Course created: ${courseId}\n`);

    // Create chapters
    console.log("📖 Creating chapters...");
    const chapters = [
      {
        courseId: courseId,
        title: "Module 1: Understanding Generative AI",
        description: "Learn the fundamentals of generative AI and how it works",
        order: 1,
      },
      {
        courseId: courseId,
        title: "Module 2: Getting Started with AI Tools",
        description: "Explore popular AI tools and how to get started",
        order: 2,
      },
      {
        courseId: courseId,
        title: "Module 3: Prompting Best Practices",
        description: "Master the art of writing effective prompts",
        order: 3,
      },
      {
        courseId: courseId,
        title: "Module 4: Advanced Techniques",
        description: "Learn advanced prompting and reasoning techniques",
        order: 4,
      },
      {
        courseId: courseId,
        title: "Module 5: Practical Applications",
        description: "Apply AI to real-world tasks and workflows",
        order: 5,
      },
    ];

    const chapterIds: string[] = [];
    for (const chapter of chapters) {
      const chapterRef = await db.collection("chapters").add({
        ...chapter,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      chapterIds.push(chapterRef.id);
      console.log(`✓ Chapter created: ${chapter.title}`);
    }
    console.log();

    // Create lessons for each chapter
    console.log("🎬 Creating lessons...");
    const lessons = [
      {
        chapterId: chapterIds[0],
        title: "What is Generative AI?",
        description: "Understanding the basics of generative AI",
        videoId: "cf-video-genai-001",
        duration: 600,
        order: 1,
      },
      {
        chapterId: chapterIds[0],
        title: "How GenAI Models Work",
        description: "Deep dive into how generative models are trained and work",
        videoId: "cf-video-genai-002",
        duration: 720,
        order: 2,
      },
      {
        chapterId: chapterIds[1],
        title: "Popular AI Tools Overview",
        description: "Comparing ChatGPT, Claude, Gemini, and other tools",
        videoId: "cf-video-genai-003",
        duration: 540,
        order: 1,
      },
      {
        chapterId: chapterIds[1],
        title: "Setting Up Your First Account",
        description: "Step-by-step guide to creating and configuring AI accounts",
        videoId: "cf-video-genai-004",
        duration: 480,
        order: 2,
      },
      {
        chapterId: chapterIds[2],
        title: "Writing Effective Prompts",
        description: "Learn the principles of prompt engineering",
        videoId: "cf-video-genai-005",
        duration: 660,
        order: 1,
      },
      {
        chapterId: chapterIds[2],
        title: "Prompt Examples and Patterns",
        description: "Real-world prompt examples for different use cases",
        videoId: "cf-video-genai-006",
        duration: 540,
        order: 2,
      },
      {
        chapterId: chapterIds[3],
        title: "Few-Shot Prompting",
        description: "Using examples to improve AI outputs",
        videoId: "cf-video-genai-007",
        duration: 480,
        order: 1,
      },
      {
        chapterId: chapterIds[3],
        title: "Chain-of-Thought Reasoning",
        description: "Making AI explain its thinking process",
        videoId: "cf-video-genai-008",
        duration: 600,
        order: 2,
      },
      {
        chapterId: chapterIds[4],
        title: "Content Creation with AI",
        description: "Using AI for writing, blogging, and social media",
        videoId: "cf-video-genai-009",
        duration: 720,
        order: 1,
      },
      {
        chapterId: chapterIds[4],
        title: "Code Generation and Data Analysis",
        description: "Leveraging AI for programming and analytics tasks",
        videoId: "cf-video-genai-010",
        duration: 780,
        order: 2,
      },
    ];

    const lessonIds: string[] = [];
    for (const lesson of lessons) {
      const lessonRef = await db.collection("lessons").add({
        ...lesson,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      lessonIds.push(lessonRef.id);
      console.log(`✓ Lesson created: ${lesson.title}`);
    }
    console.log();

    // Create transcripts for the first lesson
    console.log("📝 Creating transcripts...");
    const transcriptSegments = [
      {
        startTime: 0,
        endTime: 30000,
        text: "Welcome to Achieve More With GenAI. In this course, you'll learn how to leverage generative AI to boost your productivity and achieve more in less time.",
        speaker: "Instructor",
        order: 1,
      },
      {
        startTime: 30000,
        endTime: 60000,
        text: "Generative AI is a type of artificial intelligence that can create new content based on patterns it has learned from training data. This includes text, images, code, and more.",
        speaker: "Instructor",
        order: 2,
      },
      {
        startTime: 60000,
        endTime: 90000,
        text: "The key difference between generative AI and traditional machine learning is that generative models can produce entirely new outputs, not just classify or predict existing data.",
        speaker: "Instructor",
        order: 3,
      },
      {
        startTime: 90000,
        endTime: 120000,
        text: "Common applications include chatbots, content creation, code generation, and creative tools.",
        speaker: "Instructor",
        order: 4,
      },
      {
        startTime: 120000,
        endTime: 180000,
        text: "There are many AI tools available today. Some popular ones include ChatGPT, Claude, Gemini, and Copilot.",
        speaker: "Instructor",
        order: 5,
      },
      {
        startTime: 180000,
        endTime: 240000,
        text: "Each tool has its own strengths and weaknesses. ChatGPT is great for general-purpose tasks, while specialized tools might be better for specific domains.",
        speaker: "Instructor",
        order: 6,
      },
      {
        startTime: 240000,
        endTime: 300000,
        text: "To get started, you'll need to create an account on your chosen platform and familiarize yourself with the interface.",
        speaker: "Instructor",
        order: 7,
      },
      {
        startTime: 300000,
        endTime: 360000,
        text: "The quality of your prompts directly affects the quality of AI outputs. A good prompt is clear, specific, and provides context.",
        speaker: "Instructor",
        order: 8,
      },
      {
        startTime: 360000,
        endTime: 420000,
        text: "Instead of asking 'Write a blog post', try 'Write a 500-word blog post about productivity tips for remote workers, targeting beginners'.",
        speaker: "Instructor",
        order: 9,
      },
      {
        startTime: 420000,
        endTime: 480000,
        text: "You should also provide examples of the style or format you want. This helps the AI understand your expectations better.",
        speaker: "Instructor",
        order: 10,
      },
      {
        startTime: 480000,
        endTime: 540000,
        text: "Once you're comfortable with basic prompting, you can explore more advanced techniques like few-shot prompting, chain-of-thought reasoning, and prompt chaining.",
        speaker: "Instructor",
        order: 11,
      },
      {
        startTime: 540000,
        endTime: 600000,
        text: "Thank you for taking this course. We hope you found it valuable!",
        speaker: "Instructor",
        order: 12,
      },
    ];

    // Add transcripts to the first lesson
    for (const segment of transcriptSegments) {
      await db.collection("transcripts").add({
        lessonId: lessonIds[0],
        ...segment,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`✓ Created ${transcriptSegments.length} transcript segments\n`);

    console.log("✅ Firebase seed completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Course ID: ${courseId}`);
    console.log(`   - Chapters: ${chapterIds.length}`);
    console.log(`   - Lessons: ${lessonIds.length}`);
    console.log(`   - Transcripts: ${transcriptSegments.length}`);
    console.log("\n🚀 You can now access the course at:");
    console.log(`   /course/${courseId}/lesson/${lessonIds[0]}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

// Run the seed
seedFirebase().then(() => {
  process.exit(0);
});
