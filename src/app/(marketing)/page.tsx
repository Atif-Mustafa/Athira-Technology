import { Code, Shield, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { FadeIn, StaggerContainer, StaggerItem } from "../../components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Athira Technology | The Autonomous SDLC Workforce",
  description: "Athira provides autonomous AI agents that handle planning, development, testing, and deployment. Build faster with the most advanced AI software engineer.",
};

export default function Home() {
  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Autonomous Coding",
      desc: "From architecture to implementation, our AI writes clean, type-safe, and scalable code."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      desc: "SOC2 compliant, zero-retention memory models, and end-to-end encryption for your IP."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast CI/CD",
      desc: "Agents integrate directly into your GitHub Actions pipeline for instant deployment."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none"></div>
      
      <StaggerContainer className="max-w-4xl space-y-8 mt-24 relative z-10" staggerChildren={0.1}>
        <StaggerItem>
          <Badge variant="default" className="px-3 py-1 uppercase tracking-widest text-xs">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Athira v2.0 is now live
          </Badge>
        </StaggerItem>
        
        <StaggerItem>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Intelligence for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              modern SDLC.
            </span>
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Athira provides autonomous AI agents that handle planning, development, testing, and deployment. Build faster with the most advanced AI software engineer.
          </p>
        </StaggerItem>

        <StaggerItem>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/contact">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/ai-software-engineer">
                Meet the AI Engineer
              </Link>
            </Button>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Feature Grid */}
      <StaggerContainer delayChildren={0.3} staggerChildren={0.1} className="w-full max-w-7xl mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left pb-32 relative z-10">
        {features.map((feature, i) => (
          <StaggerItem key={i} className="h-full">
            <Card className="h-full group hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500 mb-2 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feature.desc}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
