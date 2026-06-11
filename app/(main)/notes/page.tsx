"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  Clock,
  ChevronRight,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { getNotes, addNote, editNote, deleteNote } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ConfirmationModal";
// Export PDF
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";

type Note = {
  id: number;
  user_id: number;
  title: string;
  contents: string;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "delete" | "edit" | "save";
    targetId?: number;
  }>({ isOpen: false, type: "delete" });

  const fetchNotes = async () => {
    try {
      const res = await getNotes();
      if (!res.error) {
        setNotes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleNewNote = () => {
    const newNoteTemplate = {
      id: Date.now() * -1, // Temporary negative ID
      user_id: 1,
      title: "Untitled Note",
      contents: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setActiveNote(newNoteTemplate);
    setEditTitle(newNoteTemplate.title);
    setEditContent(newNoteTemplate.contents);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!activeNote) return;
    setIsSaving(true);
    try {
      if (activeNote.id < 0) {
        // Create new
        const res = await addNote(editTitle, editContent);
        const savedNote = res.data || res;
        if (!res.error || res.id) {
          setNotes([...notes, savedNote]);
          setActiveNote(savedNote);
          setIsEditing(false);
        }
      } else {
        // Edit existing
        const res = await editNote(activeNote.id, editTitle, editContent);
        const savedNote = res.data || res;
        if (!res.error || savedNote?.id || res.message) {
          // Force local state to reflect the edited fields immediately to ensure UI responsiveness
          const updatedNoteObj = {
            ...activeNote,
            ...(savedNote?.id ? savedNote : {}),
            title: editTitle,
            contents: editContent,
            updated_at: new Date().toISOString(),
          };
          const updatedNotes = notes.map((n) =>
            n.id === activeNote.id ? updatedNoteObj : n,
          );
          setNotes(updatedNotes);
          setActiveNote(updatedNoteObj);
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save note. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (id < 0) {
      setActiveNote(null);
      setIsEditing(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await deleteNote(id);
      if (!res.error) {
        setNotes(notes.filter((n) => n.id !== id));
        if (activeNote?.id === id) {
          setActiveNote(null);
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPDF = () => {
    if (!activeNote) return;
    const doc = new jsPDF();

    // Judul
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(activeNote.title, 20, 20);

    // Isi
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const splitText = doc.splitTextToSize(activeNote.contents, 170);
    doc.text(splitText, 20, 30);

    doc.save(`${activeNote.title}.pdf`);
  };

  const selectNote = (note: Note) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.contents);
    setIsEditing(false);
  };

  return (
    <div className="flex h-full bg-background overflow-hidden relative">
      {/* Left Pane: Note List */}
      <div
        className={cn(
          "w-full md:w-80 h-full border-r border-outline-variant/30 flex-col bg-surface/30 shrink-0",
          activeNote ? "hidden md:flex" : "flex",
        )}
      >
        <div className="p-6 pl-16 md:pl-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h2 className="typography-headline-sm text-on-surface">Catatan</h2>
          <button
            onClick={handleNewNote}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-center text-outline typography-body-md p-4">
              Tidak ada cacatan, ayo mulai membuat!
            </p>
          ) : (
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => selectNote(note)}
                  className={cn(
                    "p-4 rounded-xl cursor-pointer transition-all border",
                    activeNote?.id === note.id
                      ? "bg-surface-container-lowest border-primary/30 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                      : "bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container",
                  )}
                >
                  <h3 className="font-hanken font-semibold text-on-surface mb-1 truncate">
                    {note.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-outline truncate mb-2">
                    {note.contents || "No content"}
                  </p>
                  <div className="flex items-center text-xs text-on-surface-variant gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Right Pane: Note Editor / Viewer */}
      <div
        className={cn(
          "flex-1 h-full flex-col bg-surface-container-lowest relative",
          activeNote ? "flex" : "hidden md:flex",
        )}
      >
        {activeNote ? (
          <motion.div
            key={activeNote.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col h-full"
          >
            {/* Editor Header */}
            <div className="h-20 px-4 md:px-8 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-on-surface-variant typography-label-sm">
                <button
                  className="md:hidden p-2 -ml-2 hover:bg-surface-container rounded-lg"
                  onClick={() => {
                    setActiveNote(null);
                    setIsEditing(false);
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <FileText className="w-4 h-4 hidden sm:block" />
                <span className="hidden sm:inline">
                  Terakhir diedit{" "}
                  {new Date(activeNote.updated_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button
                    onClick={() =>
                      setModalConfig({ isOpen: true, type: "save" })
                    }
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors text-sm font-medium shadow-sm shadow-primary/20 disabled:opacity-70"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setModalConfig({ isOpen: true, type: "edit" })
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface hover:bg-outline-variant/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4 hidden sm:block" /> Edit
                    </button>

                    {/* Tombol Export PDF */}
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface hover:bg-outline-variant/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      <FileDown className="w-4 h-4 hidden sm:block" />
                      <span className="hidden sm:inline">Export PDF</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() =>
                    setModalConfig({
                      isOpen: true,
                      type: "delete",
                      targetId: activeNote.id,
                    })
                  }
                  disabled={isDeleting}
                  className="p-2 text-error hover:bg-error-container/50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full">
              {isEditing ? (
                <div className="flex flex-col h-full gap-6">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note Title"
                    className="typography-display-lg outline-none text-on-surface placeholder:text-outline/50 bg-transparent"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Start typing your research notes..."
                    className="flex-1 resize-none outline-none typography-body-lg text-on-surface-variant placeholder:text-outline/50 bg-transparent leading-relaxed"
                  />
                </div>
              ) : (
                <div className="prose prose-lg prose-slate max-w-none">
                  <h1 className="typography-display-lg text-on-surface mb-8">
                    {activeNote.title}
                  </h1>
                  <p className="typography-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {activeNote.contents}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-outline">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p className="typography-headline-sm">
              Pilih catatan untuk dilihat
            </p>
            <p className="typography-body-md mt-2">atau buat yang baru</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (
            modalConfig.type === "delete" &&
            modalConfig.targetId !== undefined
          ) {
            handleDelete(modalConfig.targetId);
            setModalConfig((prev) => ({ ...prev, isOpen: false }));
          } else if (modalConfig.type === "edit") {
            setIsEditing(true);
            setModalConfig((prev) => ({ ...prev, isOpen: false }));
          } else if (modalConfig.type === "save") {
            handleSave();
            setModalConfig((prev) => ({ ...prev, isOpen: false }));
          }
        }}
        title={
          modalConfig.type === "delete"
            ? "Konfirmasi Hapus"
            : modalConfig.type === "edit"
              ? "Konfirmasi Edit"
              : "Konfirmasi Simpan"
        }
        message={
          modalConfig.type === "delete"
            ? "Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan."
            : modalConfig.type === "edit"
              ? "Apakah Anda yakin ingin mengedit catatan ini?"
              : "Apakah Anda yakin ingin menyimpan perubahan pada catatan ini?"
        }
        confirmLabel={
          modalConfig.type === "delete"
            ? "Hapus"
            : modalConfig.type === "edit"
              ? "Edit"
              : "Simpan"
        }
        variant={modalConfig.type === "delete" ? "danger" : "info"}
        isLoading={isDeleting || isSaving}
      />
    </div>
  );
}
