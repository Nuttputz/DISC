import React, { useMemo, useState, useEffect } from "react";

// ----- CONFIG -----
const QUESTIONS = [
  "ฉันตัดสินใจได้รวดเร็วเมื่อมีข้อมูลพอประมาณ",
  "ฉันชอบระดมไอเดียและดึงคนให้มีส่วนร่วม",
  "ฉันให้ความสำคัญกับความกลมเกลียวในทีม",
  "ฉันพิถีพิถันกับรายละเอียดและมาตรฐานงาน",
  "เมื่อมีอุปสรรค ฉันผลักดันให้ทีมเดินหน้าต่อทันที",
  "ฉันเล่าเรื่องและสื่อสารเก่งจนคนรอบตัวมีพลัง",
  "ฉันมักช่วยเหลือ สนับสนุน และเป็นผู้ฟังที่ดี",
  "ฉันชอบทำงานบนข้อมูล อ้างอิง และกระบวนการที่ชัด",
  "ฉันโฟกัสผลลัพธ์ ตัวเลข และเส้นตาย",
  "ฉันสร้างเครือข่าย/ความสัมพันธ์ได้ง่าย",
  "ฉันทำงานได้ดีที่สุดเมื่อแผนชัดและค่อย ๆ ก้าว",
  "ฉันชอบเช็กลิสต์ ตรวจทาน และลดความเสี่ยง",
  "ฉันกล้าเผชิญความขัดแย้งอย่างสร้างสรรค์",
  "ฉันมองหาโอกาสใหม่ ๆ และชอบนำเสนอไอเดีย",
  "ฉันให้ความสำคัญกับความรู้สึกของเพื่อนร่วมงาน",
  "ฉันวิเคราะห์สาเหตุเชิงลึกก่อนลงมือ",
  "ฉันภูมิใจกับการเป็น “ตัวผลักดันงานให้เสร็จ”",
  "ฉันชอบทำงานที่มีการปฏิสัมพันธ์สูง สนุก คึกคัก",
  "ฉันรักษาคำมั่นสัญญาและความต่อเนื่องเป็นอันดับแรก",
  "ฉันต้องการหลักฐาน/ข้อมูลรองรับก่อนตัดสินใจ",
  "ฉันยอมรับความเสี่ยงที่พอเหมาะเพื่อให้ถึงเป้า",
  "ฉันมักเป็นคนสร้างบรรยากาศบวกในทีม",
  "ฉันอดทน ใจเย็น และชอบช่วยให้ทีมรู้สึกปลอดภัย",
  "ฉันชอบระบบ ระเบียบ และวิธีทำงานที่เป็นมาตรฐาน",
];

// Mapping of question indexes (1-based) to styles
const MAPPING = {
  D: [1, 5, 9, 13, 17, 21],
  I: [2, 6, 10, 14, 18, 22],
  S: [3, 7, 11, 15, 19, 23],
  C: [4, 8, 12, 16, 20, 24],
};

const STYLE_LABELS = {
  D: "D – Dominance (มุ่งเป้า/ตัดสินใจไว)",
  I: "I – Influence (พลังคน/สื่อสาร)",
  S: "S – Steadiness (มั่นคง/สนับสนุน)",
  C: "C – Conscientious (มาตรฐาน/วิเคราะห์)",
};

const band = (x) => (x >= 24 ? "เด่นมาก" : x >= 18 ? "เด่นปานกลาง" : x >= 12 ? "เป็นรอง" : "น้อย");

// ----- STORAGE HELPERS -----
const STORAGE_KEY = "disc-webapp-records-v1";
const loadRecords = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
const saveRecords = (records) => localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

// ----- COMPONENTS -----
function Likert({ value, onChange, name }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((v) => (
        <label key={v} className={`px-3 py-1 rounded-xl cursor-pointer border ${value === v ? "border-black" : "border-gray-300"}`}>
          <input
            type="radio"
            name={name}
            value={v}
            className="hidden"
            onChange={() => onChange(v)}
            checked={value === v}
          />
          {v}
        </label>
      ))}
    </div>
  );
}

function calcScores(answers) {
  const total = { D: 0, I: 0, S: 0, C: 0 };
  (Object.keys(MAPPING)).forEach((k) => {
    total[k] = MAPPING[k].reduce((acc, idx) => acc + (answers[idx - 1] || 0), 0);
  });
  return total;
}

function Top2({ scores }) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [t1, t2] = entries;
  if (!t1) return null;
  return (
    <div className="grid gap-1 text-sm">
      <div className="font-semibold">Top 2 สไตล์:</div>
      <div>{t1[0]} ({t1[1]}) • {STYLE_LABELS[t1[0]]}</div>
      {t2 && <div>{t2[0]} ({t2[1]}) • {STYLE_LABELS[t2[0]]}</div>}
    </div>
  );
}

function ExportCSVButton({ records }) {
  const onExport = () => {
    const headers = [
      "timestamp","name","department","D","I","S","C","bandD","bandI","bandS","bandC",
      ...QUESTIONS.map((_, i) => `Q${i + 1}`),
    ];
    const rows = records.map((r) => [
      r.timestamp, r.name, r.department, r.scores.D, r.scores.I, r.scores.S, r.scores.C,
      band(r.scores.D), band(r.scores.I), band(r.scores.S), band(r.scores.C),
      ...r.answers.map((a) => a ?? ""),
    ]);
    const csv = [headers, ...rows].map((arr) => arr.map((x) => (typeof x === "string" && x.includes(",")) ? `"${x.replaceAll('"','""')}"` : x).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "DISC_Results.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={onExport} className="px-4 py-2 rounded-xl border shadow-sm hover:shadow w-full md:w-auto">ส่งออก CSV</button>
  );
}

function RecordRow({ rec, onEdit, onDelete }) {
  return (
    <div className="grid md:grid-cols-8 grid-cols-2 items-center gap-2 p-3 border rounded-2xl">
      <div className="md:col-span-2 font-semibold">{rec.name}</div>
      <div className="md:block hidden">{rec.department || "-"}</div>
      <div>D: {rec.scores.D}</div>
      <div>I: {rec.scores.I}</div>
      <div>S: {rec.scores.S}</div>
      <div>C: {rec.scores.C}</div>
      <div className="flex gap-2 justify-end col-span-2 md:col-span-1">
        <button className="px-3 py-1 rounded-xl border" onClick={() => onEdit(rec.id)}>แก้ไข</button>
        <button className="px-3 py-1 rounded-xl border" onClick={() => onDelete(rec.id)}>ลบ</button>
      </div>
    </div>
  );
}

export default function App() {
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => setRecords(loadRecords()), []);
  useEffect(() => saveRecords(records), [records]);

  const onDelete = (id) => setRecords((r) => r.filter((x) => x.id !== id));
  const onEdit = (id) => setEditingId(id);

  const startNew = () => setEditingId("new");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10">
      <div className="max-w-5xl mx-auto grid gap-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">DISC WebApp – บันทึกผลผู้เข้าอบรม</h1>
            <p className="text-sm text-gray-600">เก็บข้อมูลบนเบราว์เซอร์ (localStorage) • ส่งออก CSV เพื่อนำเข้า Google Sheets ได้</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl border shadow-sm hover:shadow" onClick={startNew}>เพิ่มผลการทำแบบทดสอบ</button>
            <ExportCSVButton records={records} />
          </div>
        </header>

        {editingId && (
          <AssessmentForm
            key={editingId}
            initial={editingId === "new" ? null : records.find((r) => r.id === editingId)}
            onCancel={() => setEditingId(null)}
            onSave={(rec) => {
              setRecords((prev) => {
                const exists = prev.some((x) => x.id === rec.id);
                return exists ? prev.map((x) => (x.id === rec.id ? rec : x)) : [rec, ...prev];
              });
              setEditingId(null);
            }}
          />
        )}

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold">รายการผลทั้งหมด ({records.length})</h2>
          {records.length === 0 ? (
            <div className="p-6 border rounded-2xl text-gray-600">ยังไม่มีข้อมูล—กด “เพิ่มผลการทำแบบทดสอบ” เพื่อเริ่มบันทึก</div>
          ) : (
            <div className="grid gap-2">
              {records.map((rec) => (
                <RecordRow key={rec.id} rec={rec} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AssessmentForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [department, setDepartment] = useState(initial?.department || "");
  const [answers, setAnswers] = useState(initial?.answers || Array(QUESTIONS.length).fill(null));

  const scores = useMemo(() => calcScores(answers), [answers]);
  const doneCount = answers.filter((x) => x != null).length;

  const onChange = (idx, value) => {
    setAnswers((a) => {
      const b = [...a];
      b[idx] = value; return b;
    });
  };

  const handleSave = () => {
    const id = initial?.id || crypto.randomUUID();
    const rec = {
      id,
      timestamp: new Date().toISOString(),
      name: name.trim() || "ผู้ไม่ประสงค์ออกนาม",
      department: department.trim(),
      answers,
      scores,
    };
    onSave(rec);
  };

  const percent = Math.round((doneCount / QUESTIONS.length) * 100);

  return (
    <section className="grid gap-4 p-4 md:p-6 border rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">แบบทดสอบ DISC (24 ข้อ)</h2>
        <button className="px-3 py-1 rounded-xl border" onClick={onCancel}>ปิด</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1">
          <label className="text-sm text-gray-600">ชื่อผู้ทำแบบทดสอบ</label>
          <input className="border rounded-xl px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น นายสมชาย ใจดี" />
        </div>
        <div className="grid gap-1">
          <label className="text-sm text-gray-600">แผนก/หน่วยงาน</label>
          <input className="border rounded-xl px-3 py-2" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="เช่น ฝ่ายปฏิบัติการ" />
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="bg-black h-3" style={{ width: `${percent}%` }} />
      </div>
      <div className="text-sm text-gray-600">ความคืบหน้า: {doneCount}/{QUESTIONS.length} ข้อ ({percent}%)</div>

      <div className="grid gap-3">
        {QUESTIONS.map((q, i) => (
          <div key={i} className="p-3 border rounded-2xl bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium">{i + 1}. {q}</div>
              <Likert name={`q${i}`} value={answers[i]} onChange={(v) => onChange(i, v)} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <h3 className="font-semibold">สรุปคะแนน</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(scores).map(([k, v]) => (
              <div key={k} className="p-3 border rounded-2xl text-center">
                <div className="font-semibold">{k}</div>
                <div className="text-2xl">{v}</div>
                <div className="text-xs text-gray-600">{STYLE_LABELS[k]}</div>
                <div className="text-xs mt-1">ช่วง: {band(v)}</div>
              </div>
            ))}
          </div>
          <Top2 scores={scores} />
        </div>
        <div className="grid gap-2 text-sm">
          <h3 className="font-semibold">เกณฑ์แปลผล</h3>
          <ul className="list-disc pl-6">
            <li>24–30 = เด่นมาก</li>
            <li>18–23 = เด่นปานกลาง</li>
            <li>12–17 = เป็นรอง</li>
            <li>6–11 = น้อย</li>
          </ul>
          <p className="text-gray-600">หมายเหตุ: แบบทดสอบนี้ใช้เพื่อพัฒนาการสื่อสารและการทำงานร่วมกัน ไม่ใช่การวัดทางคลินิก</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <div className="text-sm text-gray-600">* ข้อมูลจะถูกเก็บในอุปกรณ์นี้เท่านั้น (LocalStorage)</div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={handleSave}>บันทึกผล</button>
          <button className="px-4 py-2 rounded-xl border" onClick={() => setAnswers(Array(QUESTIONS.length).fill(null))}>ล้างคำตอบ</button>
        </div>
      </div>
    </section>
  );
}
