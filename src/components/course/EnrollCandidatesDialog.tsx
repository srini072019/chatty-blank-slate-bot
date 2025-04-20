
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useExamCandidates } from "@/hooks/useExamCandidates";
import { useEnrollment } from "@/hooks/useEnrollment";

interface EnrollCandidatesDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EnrollCandidatesDialog = ({ courseId, isOpen, onClose }: EnrollCandidatesDialogProps) => {
  const { candidates } = useExamCandidates(courseId);
  const { enrollParticipants, isLoading } = useEnrollment();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const handleEnroll = async () => {
    if (selectedEmails.length === 0) return;
    
    const result = await enrollParticipants(courseId, selectedEmails);
    if (result.success) {
      setSelectedEmails([]);
      onClose();
    }
  };

  const toggleCandidate = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enroll Candidates</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(candidate.email || '')}
                      onChange={() => toggleCandidate(candidate.email || '')}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  <TableCell>{candidate.displayName}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleEnroll} 
            disabled={selectedEmails.length === 0 || isLoading}
          >
            {isLoading ? 'Enrolling...' : 'Enroll Selected'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollCandidatesDialog;
