import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Preview } from '@/components/Preview';
import { CVData } from '@/lib/types';
import { defaultCVData } from '@/lib/defaultData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster as ToasterProvider } from "@/components/ui/toaster";
import { Toaster } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';

function App() {
  const [cvData, setCVData] = useState<CVData>(defaultCVData);
  const [activeTab, setActiveTab] = useState<string>('edit');
  const [history, setHistory] = useState<CVData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isMobile = useIsMobile();

  // Try to load saved state from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('cv-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCVData(parsedData);
        setHistory([parsedData]);
        setHistoryIndex(0);
      } catch (e) {
        console.error('Failed to parse saved CV data', e);
      }
    } else {
      setHistory([defaultCVData]);
      setHistoryIndex(0);
    }
  }, []);

  // Handle undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setCVData(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // Handle redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setCVData(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // Custom setCVData function that also updates history
  const updateCVData = useCallback((newData: CVData) => {
    setCVData(newData);
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add the new state to history
    setHistory([...newHistory, newData]);
    setHistoryIndex(historyIndex + 1);
    
    // Save to localStorage
    localStorage.setItem('cv-data', JSON.stringify(newData));
  }, [history, historyIndex]);

  if (isMobile) {
    return (
      <TooltipProvider>
        <ToasterProvider />
        <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50">
          <Toaster position="top-center" richColors />
          <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
            <div className="p-4 border-b bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">ImpactCV</h1>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleUndo} 
                    disabled={historyIndex <= 0}
                    title="Undo"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleRedo} 
                    disabled={historyIndex >= history.length - 1}
                    title="Redo"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="edit" className="transition-all">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="transition-all">Preview</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="edit" className="mt-0 p-0 h-[calc(100vh-125px)] animate-fade-in">
              <Sidebar data={cvData} onChange={updateCVData} />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0 p-4 h-[calc(100vh-125px)] overflow-auto animate-fade-in">
              <Preview data={cvData} />
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <ToasterProvider />
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 animate-fade-in">
        <Toaster position="top-right" richColors />
        <div className="container mx-auto py-6 px-4">
          <div className="bg-white/40 backdrop-blur-md rounded-xl border shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="flex justify-end gap-2 p-2 bg-white/50 border-b">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUndo} 
                disabled={historyIndex <= 0}
                className="flex items-center gap-1"
                title="Undo"
              >
                <Undo2 className="h-4 w-4" />
                <span>Undo</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRedo} 
                disabled={historyIndex >= history.length - 1}
                className="flex items-center gap-1"
                title="Redo"
              >
                <Redo2 className="h-4 w-4" />
                <span>Redo</span>
              </Button>
            </div>
            <ResizablePanelGroup direction="horizontal" className="min-h-[800px]">
              <ResizablePanel defaultSize={30} minSize={25} maxSize={40} className="transition-all">
                <Sidebar data={cvData} onChange={updateCVData} />
              </ResizablePanel>
              
              <ResizableHandle withHandle className="bg-gray-200 transition-colors hover:bg-gray-300" />
              
              <ResizablePanel defaultSize={70} className="transition-all">
                <div className="h-full bg-gray-50/80 backdrop-blur-sm flex items-center justify-center p-8 overflow-auto">
                  <Preview data={cvData} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}


export default App;
