import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Comic } from "../../types";
import Modal from "../shared/Modal";
import Input from "../shared/Input";
import Button from "../shared/Button";
import { apiService } from "../../utils/apiService";
import { GRADE_SELECT_OPTIONS, matchGradeFromInput } from "../../utils/gradeScale";
import * as S from "./styles";

/** Allowed "Why is this a key?" options (stored as-is in grailReason) */
const GRAIL_REASON_OPTIONS = [
  "",
  "First appearance",
  "Limited run",
  "First print",
  "Origin",
  "Major event",
  "Cameo",
  "Key death",
  "Variant / cover",
  "Other",
];

interface EditComicModalProps {
  isOpen: boolean;
  onClose: () => void;
  comic: Comic | null;
  onSave: (comic: Comic) => void;
}

function toDateInputValue(value: string | Date | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const EditComicModal: React.FC<EditComicModalProps> = ({
  isOpen,
  onClose,
  comic,
  onSave,
}) => {
  const [pricePaid, setPricePaid] = useState("");
  const [grade, setGrade] = useState("");
  const [datePurchased, setDatePurchased] = useState("");
  const [notes, setNotes] = useState("");
  const [grailReason, setGrailReason] = useState("");
  const [artist, setArtist] = useState("");
  const [writer, setWriter] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [firstAppearance, setFirstAppearance] = useState("");
  const [variantDetails, setVariantDetails] = useState("");
  const [cert, setCert] = useState("");
  const [signed, setSigned] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!comic) return;
    setPricePaid(
      comic.pricePaid != null ? String(comic.pricePaid) : ""
    );
    setGrade(matchGradeFromInput(comic.grade) ?? "");
    const dateVal = toDateInputValue(comic.datePurchased);
    setDatePurchased(
      comic.collected && !dateVal
        ? toDateInputValue(new Date())
        : dateVal
    );
    setNotes(comic.notes ?? "");
    setGrailReason(comic.grailReason ?? "");
    setArtist(comic.artist ?? "");
    setWriter(comic.writer ?? "");
    setStorageLocation(comic.storageLocation ?? "");
    setFirstAppearance(comic.firstAppearance ?? "");
    setVariantDetails(comic.variantDetails ?? "");
    setCert(comic.cert ?? "");
    setSigned(Boolean(comic.signed));
    setError(null);
  }, [comic]);

  if (!comic) return null;

  const canSaveGrail = !comic.isGrail || grailReason.trim() !== "";
  const title = `Edit ${comic.series}${comic.volume ? ` (${comic.volume})` : ""} #${comic.issue}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload: Record<string, unknown> = {};
    const pricePaidNum = pricePaid.trim() === "" ? null : parseFloat(pricePaid);
    payload.pricePaid =
      pricePaidNum !== null && !Number.isNaN(pricePaidNum)
        ? pricePaidNum
        : null;
    payload.grade = grade.trim() || null;
    payload.datePurchased = datePurchased.trim()
      ? new Date(datePurchased).toISOString()
      : null;
    payload.notes = notes.trim() || null;
    if (comic.isGrail) {
      payload.grailReason = grailReason.trim() || null;
    }
    if (showMore) {
      payload.artist = artist.trim() || null;
      payload.writer = writer.trim() || null;
      payload.storageLocation = storageLocation.trim() || null;
      payload.firstAppearance = firstAppearance.trim() || null;
      payload.variantDetails = variantDetails.trim() || null;
      payload.cert = cert.trim() || null;
      payload.signed = signed;
    }

    try {
      const updated = await apiService.comics.update(
        comic.id,
        payload as Partial<Comic>
      );
      onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="medium">
      <S.Form onSubmit={handleSubmit}>
        <S.FormSection>
          <S.SectionTitle>Collection details</S.SectionTitle>
          <S.Row>
            <Input
              label="Price paid ($)"
              type="number"
              min={0}
              step={0.01}
              value={pricePaid}
              onChange={(e) => setPricePaid(e.target.value)}
              placeholder="0.00"
              fullWidth
            />
            <S.SelectWrapper>
              <S.SelectLabel htmlFor="edit-grade">Grade</S.SelectLabel>
              <S.StyledSelect
                id="edit-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                aria-label="Grade"
              >
                <option value="">— No grade —</option>
                {GRADE_SELECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </S.StyledSelect>
            </S.SelectWrapper>
          </S.Row>
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <Input
              label="Date purchased"
              type="date"
              value={datePurchased}
              onChange={(e) => setDatePurchased(e.target.value)}
              fullWidth
            />
          </div>
          <Input
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
            fullWidth
          />
        </S.FormSection>

        {comic.isGrail && (
          <S.FormSection>
            <S.SectionTitle>Why is this a key?</S.SectionTitle>
            <S.SelectWrapper>
              <S.SelectLabel htmlFor="edit-grail-reason">Why is this a key?</S.SelectLabel>
              <S.StyledSelect
                id="edit-grail-reason"
                value={grailReason}
                onChange={(e) => setGrailReason(e.target.value)}
                aria-label="Why is this a key?"
              >
                {GRAIL_REASON_OPTIONS.map((opt) => (
                  <option key={opt || "__none__"} value={opt}>
                    {opt || "— Select —"}
                  </option>
                ))}
              </S.StyledSelect>
            </S.SelectWrapper>
          </S.FormSection>
        )}

        <S.MoreToggle
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
        >
          {showMore ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
          {showMore ? "Less" : "More"} (artist, writer, storage, etc.)
        </S.MoreToggle>

        {showMore && (
          <S.MoreSection>
            <S.Row>
              <Input
                label="Artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                fullWidth
              />
              <Input
                label="Writer"
                value={writer}
                onChange={(e) => setWriter(e.target.value)}
                fullWidth
              />
            </S.Row>
            <Input
              label="Storage location"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="e.g. Long box 3"
              fullWidth
            />
            <Input
              label="First appearance"
              value={firstAppearance}
              onChange={(e) => setFirstAppearance(e.target.value)}
              placeholder="e.g. Character name"
              fullWidth
            />
            <Input
              label="Variant details"
              value={variantDetails}
              onChange={(e) => setVariantDetails(e.target.value)}
              fullWidth
            />
            <Input
              label="Cert number"
              value={cert}
              onChange={(e) => setCert(e.target.value)}
              placeholder="CGC/CBCS number"
              fullWidth
            />
            <S.CheckboxRow>
              <input
                type="checkbox"
                checked={signed}
                onChange={(e) => setSigned(e.target.checked)}
              />
              Signed
            </S.CheckboxRow>
          </S.MoreSection>
        )}

        {error && <S.FormError>{error}</S.FormError>}

        <S.Actions>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => {}}
            disabled={saving || !canSaveGrail}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </S.Actions>
      </S.Form>
    </Modal>
  );
};

export default EditComicModal;
