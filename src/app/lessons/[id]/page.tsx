import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LessonViewer from '@/components/LessonViewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Lesson: ${id} - AI Mind OS`,
    description: 'Interactive AI lesson with amazingness tracking',
  };
}

interface LessonData {
  lesson_id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  ai_topic_area: string;
  estimated_duration: number;
  relevance_score: number;
  content: {
    sections: Array<{
      title: string;
      content: string;
      duration: number;
      concepts: string[];
    }>;
    exercises: Array<{
      title: string;
      description: string;
      difficulty: string;
      estimated_time: number;
    }>;
    projects: Array<{
      title: string;
      description: string;
      difficulty: string;
      estimated_time: number;
    }>;
    key_takeaways: string[];
  };
}

// Mock lesson data (replace with API call later)
const mockLessons: Record<string, LessonData> = {
  'neural_networks_101': {
    lesson_id: 'neural_networks_101',
    title: 'Neural Networks Fundamentals',
    description: 'Learn the building blocks of artificial intelligence',
    difficulty: 'beginner',
    category: 'foundations',
    ai_topic_area: 'Core AI Foundations',
    estimated_duration: 45,
    relevance_score: 9.5,
    content: {
      sections: [
        {
          title: "Introduction to Neural Networks",
          content: "Neural networks are the foundation of modern AI. They are inspired by the human brain and consist of interconnected nodes (neurons) that process information.\n\nThink of a neural network as a complex web of simple processing units working together to solve problems. Just like your brain processes information through billions of interconnected neurons, artificial neural networks use mathematical models to simulate this process.",
          duration: 10,
          concepts: ["Artificial Neurons", "Network Architecture", "Information Processing"]
        },
        {
          title: "Basic Components",
          content: "Every neural network has three key components:\n\n1. **Input Layer**: Receives raw data (images, text, numbers)\n2. **Hidden Layers**: Process and transform the data\n3. **Output Layer**: Produces the final prediction or classification\n\nData flows through these layers like water through a series of filters, with each layer extracting more complex features and patterns.",
          duration: 15,
          concepts: ["Input Layer", "Hidden Layers", "Output Layer", "Data Flow"]
        },
        {
          title: "Activation Functions",
          content: "Activation functions determine whether a neuron should be activated (fire) or not. They add non-linearity to the network, enabling it to learn complex patterns.\n\n**Common Activation Functions:**\n- **ReLU**: f(x) = max(0, x) - Most popular, fast and effective\n- **Sigmoid**: f(x) = 1/(1+e^-x) - Outputs between 0 and 1\n- **Tanh**: f(x) = tanh(x) - Outputs between -1 and 1\n\nWithout activation functions, neural networks would just be linear models!",
          duration: 10,
          concepts: ["ReLU", "Sigmoid", "Tanh", "Non-linearity"]
        },
        {
          title: "Training Process",
          content: "Neural networks learn through a process called **backpropagation**:\n\n1. **Forward Pass**: Data flows through the network to make a prediction\n2. **Calculate Loss**: Compare prediction with actual answer\n3. **Backward Pass**: Calculate gradients and adjust weights\n4. **Repeat**: Continue until the network becomes accurate\n\nThis is like learning from mistakes - the network gets better each time it sees the error between its guess and the correct answer.",
          duration: 10,
          concepts: ["Backpropagation", "Forward Pass", "Gradients", "Weight Updates"]
        }
      ],
      exercises: [
        {
          title: "Build a Simple Perceptron",
          description: "Create the most basic neural network with just one neuron",
          difficulty: "easy",
          estimated_time: 15
        },
        {
          title: "Implement Forward Propagation",
          description: "Code the forward pass of a neural network from scratch",
          difficulty: "medium",
          estimated_time: 25
        },
        {
          title: "Calculate Gradients Manually",
          description: "Understand backpropagation by computing gradients by hand",
          difficulty: "hard",
          estimated_time: 30
        }
      ],
      projects: [
        {
          title: "Handwritten Digit Recognition",
          description: "Build a neural network that can recognize handwritten numbers (0-9)",
          difficulty: "intermediate",
          estimated_time: 120
        },
        {
          title: "Basic Image Classifier",
          description: "Create a system that can classify images into different categories",
          difficulty: "advanced",
          estimated_time: 180
        }
      ],
      key_takeaways: [
        "Neural networks are inspired by biological neurons but are mathematical models",
        "The basic structure includes input, hidden, and output layers",
        "Activation functions add non-linearity, enabling complex pattern learning",
        "Training happens through backpropagation - learning from errors",
        "Neural networks excel at finding patterns in large datasets"
      ]
    }
  },
  'transformer_architecture': {
    lesson_id: 'transformer_architecture',
    title: 'Transformer Architecture Deep Dive',
    description: 'Master the revolutionary architecture behind GPT and BERT',
    difficulty: 'intermediate',
    category: 'deep_learning',
    ai_topic_area: 'Deep Learning & Neural Networks',
    estimated_duration: 60,
    relevance_score: 10.0,
    content: {
      sections: [
        {
          title: "Introduction to Transformers",
          content: "Transformers revolutionized natural language processing and are the foundation of modern AI systems like GPT-4, BERT, and ChatGPT.\n\nBefore transformers, AI struggled with understanding long sequences of text because previous models (RNNs, LSTMs) processed words one at a time, losing important context.\n\nTransformers solved this with **attention mechanisms** - allowing the model to look at all words simultaneously and understand their relationships.",
          duration: 15,
          concepts: ["Attention Mechanism", "Sequence Processing", "Context Understanding"]
        },
        {
          title: "Self-Attention Mechanism",
          content: "Self-attention is the heart of transformers. It allows each word to 'pay attention' to every other word in the sentence.\n\n**How it works:**\n1. Each word creates three vectors: Query (Q), Key (K), and Value (V)\n2. Attention scores are calculated by comparing queries with keys\n3. These scores determine how much each word influences others\n4. The final representation combines all value vectors weighted by attention scores\n\n**Example:** In 'The cat sat on the mat', when processing 'sat', the model pays high attention to 'cat' (the subject) and 'mat' (the location).",
          duration: 20,
          concepts: ["Query-Key-Value", "Attention Scores", "Weighted Representations"]
        },
        {
          title: "Multi-Head Attention",
          content: "Multi-head attention runs several attention mechanisms in parallel, each focusing on different types of relationships.\n\n**Think of it like having multiple specialists:**\n- Head 1: Focuses on grammatical relationships\n- Head 2: Captures semantic meaning\n- Head 3: Identifies entity relationships\n- Head 4: Understands temporal connections\n\nEach head learns different patterns, and their outputs are combined to create a rich understanding of the text.",
          duration: 15,
          concepts: ["Parallel Processing", "Specialized Attention", "Feature Combination"]
        },
        {
          title: "Positional Encoding",
          content: "Since transformers process all words simultaneously, they need a way to understand word order. Positional encoding solves this.\n\n**Methods:**\n- **Absolute Positioning**: Add position-specific vectors to word embeddings\n- **Relative Positioning**: Encode relationships between word positions\n- **Learned Positioning**: Let the model learn position representations\n\nWithout positional encoding, 'AI helps humans' and 'humans help AI' would look identical to the transformer!",
          duration: 10,
          concepts: ["Word Order", "Position Vectors", "Sequence Understanding"]
        }
      ],
      exercises: [
        {
          title: "Implement Attention Mechanism",
          description: "Code the core attention calculation from scratch",
          difficulty: "medium",
          estimated_time: 45
        },
        {
          title: "Build Multi-Head Attention",
          description: "Create parallel attention heads and combine their outputs",
          difficulty: "hard",
          estimated_time: 60
        },
        {
          title: "Add Positional Encodings",
          description: "Implement position-aware embeddings for sequence understanding",
          difficulty: "medium",
          estimated_time: 30
        }
      ],
      projects: [
        {
          title: "Build a Mini-GPT Model",
          description: "Create a small transformer for text generation",
          difficulty: "advanced",
          estimated_time: 240
        },
        {
          title: "Fine-tune BERT for Classification",
          description: "Adapt a pre-trained transformer for specific tasks",
          difficulty: "intermediate",
          estimated_time: 180
        }
      ],
      key_takeaways: [
        "Transformers use attention to process entire sequences simultaneously",
        "Self-attention allows words to understand their relationships with all other words",
        "Multi-head attention captures different types of linguistic patterns",
        "Positional encoding preserves word order information",
        "This architecture powers GPT, BERT, and most modern language models"
      ]
    }
  },
  'computer_vision_cnns': {
    lesson_id: 'computer_vision_cnns',
    title: 'Computer Vision with CNNs',
    description: 'Apply deep learning to visual understanding',
    difficulty: 'intermediate',
    category: 'computer_vision',
    ai_topic_area: 'Computer Vision',
    estimated_duration: 55,
    relevance_score: 9.2,
    content: {
      sections: [
        {
          title: "Introduction to Computer Vision",
          content: "Computer vision enables machines to interpret and understand visual information, revolutionizing industries from healthcare to autonomous vehicles.\n\n**Real-world applications:**\n- Self-driving cars detecting pedestrians and obstacles\n- Medical systems analyzing X-rays and MRIs\n- Smartphones recognizing faces for security\n- Manufacturing systems identifying defective products\n\nThe challenge: How do we teach computers to 'see' like humans do?",
          duration: 10,
          concepts: ["Visual Processing", "Pattern Recognition", "Feature Detection"]
        },
        {
          title: "Convolutional Neural Networks",
          content: "CNNs are specifically designed for processing images. They use **convolutional layers** that apply filters across the image to detect features.\n\n**How convolution works:**\n1. A small filter (3x3, 5x5) slides across the image\n2. At each position, it performs element-wise multiplication\n3. The results are summed to create a feature map\n4. Different filters detect different features (edges, textures, shapes)\n\n**Key insight:** Early layers detect simple features (edges), deeper layers combine these into complex patterns (faces, objects).",
          duration: 20,
          concepts: ["Convolution Operation", "Filters", "Feature Maps", "Hierarchical Learning"]
        },
        {
          title: "Pooling and Feature Maps",
          content: "Pooling layers reduce image size while preserving important information:\n\n**Max Pooling:** Takes the maximum value in each region\n- Preserves the strongest features\n- Reduces computational cost\n- Provides translation invariance\n\n**Average Pooling:** Takes the average value in each region\n- Smooths the feature maps\n- Reduces noise\n\n**Why pooling matters:** A 1000x1000 image becomes manageable without losing essential visual information.",
          duration: 15,
          concepts: ["Max Pooling", "Average Pooling", "Dimensionality Reduction", "Translation Invariance"]
        },
        {
          title: "Modern CNN Architectures",
          content: "Evolution of CNN architectures has dramatically improved performance:\n\n**LeNet (1998):** First successful CNN for digit recognition\n**AlexNet (2012):** Breakthrough in ImageNet competition\n**VGG (2014):** Deeper networks with small filters\n**ResNet (2015):** Skip connections enabling very deep networks\n**EfficientNet (2019):** Optimized for mobile deployment\n\n**Key innovations:** Each architecture solved specific problems like vanishing gradients, computational efficiency, or accuracy improvements.",
          duration: 10,
          concepts: ["CNN Evolution", "Skip Connections", "Network Depth", "Efficiency Optimization"]
        }
      ],
      exercises: [
        {
          title: "Build a CNN from Scratch",
          description: "Implement convolutional and pooling layers manually",
          difficulty: "hard",
          estimated_time: 60
        },
        {
          title: "Compare Pooling Methods",
          description: "Test max vs average pooling on the same dataset",
          difficulty: "medium",
          estimated_time: 30
        },
        {
          title: "Visualize Feature Maps",
          description: "See what different CNN layers actually detect",
          difficulty: "easy",
          estimated_time: 20
        }
      ],
      projects: [
        {
          title: "Image Classification System",
          description: "Build a system that can classify images into 10 categories",
          difficulty: "intermediate",
          estimated_time: 150
        },
        {
          title: "Real-time Object Detection",
          description: "Create a webcam-based object detection system",
          difficulty: "advanced",
          estimated_time: 300
        }
      ],
      key_takeaways: [
        "CNNs use convolution to detect features at different scales",
        "Pooling reduces computational cost while preserving important information",
        "Modern architectures like ResNet enable very deep networks",
        "Computer vision powers many real-world AI applications",
        "Feature maps show hierarchical learning from simple to complex patterns"
      ]
    }
  }
};

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;
  const lesson = mockLessons[id];
  
  if (!lesson) {
    notFound();
  }

  return <LessonViewer lesson={lesson} />;
}
