class Learner {
  #s1;
  #s2;
  #s3;
  #attend;

  constructor(fullName, s1, s2, s3, attend) {
    if (!fullName || fullName.trim().length < 2) {
      throw new Error("اكتب اسم الطالب صح، على الأقل حرفين");
    }
    this.fullName = fullName.trim();
    this.s1 = s1;
    this.s2 = s2;
    this.s3 = s3;
    this.attend = attend;
  }

  checkValue(val, label) {
    if (val === "" || val === null || val === undefined || isNaN(val)) {
      throw new Error(`نسيت تكتب درجة ${label}`);
    }
    const num = Number(val);
    if (num < 0 || num > 100) {
      throw new Error(`درجة ${label} لازم تبقى بين 0 و 100`);
    }
    return num;
  }

  set s1(v) { this.#s1 = this.checkValue(v, "العربي"); }
  get s1() { return this.#s1; }

  set s2(v) { this.#s2 = this.checkValue(v, "الرياضيات"); }
  get s2() { return this.#s2; }

  set s3(v) { this.#s3 = this.checkValue(v, "الإنجليزي"); }
  get s3() { return this.#s3; }

  set attend(v) { this.#attend = this.checkValue(v, "الحضور"); }
  get attend() { return this.#attend; }

  calcAvg() {
    return (this.#s1 + this.#s2 + this.#s3) / 3;
  }

  calcStatus() {
    return this.calcAvg() >= 50 && this.#attend >= 75 ? "ناجح" : "يحتاج مراجعة";
  }
}

let allLearners = [];

const txtName = document.getElementById("txtName");
const txtSub1 = document.getElementById("txtSub1");
const txtSub2 = document.getElementById("txtSub2");
const txtSub3 = document.getElementById("txtSub3");
const txtAttend = document.getElementById("txtAttend");
const msgError = document.getElementById("msgError");
const boxStudents = document.getElementById("boxStudents");
const boxReport = document.getElementById("boxReport");
const countBadge = document.getElementById("countBadge");

function showMsg(text) {
  msgError.textContent = text;
  msgError.classList.remove("d-none");
}
function hideMsg() {
  msgError.classList.add("d-none");
  msgError.textContent = "";
}

function saveToStorage() {
  const data = allLearners.map(l => ({
    name: l.fullName, s1: l.s1, s2: l.s2, s3: l.s3, attend: l.attend
  }));
  localStorage.setItem("myLearners", JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem("myLearners");
  if (!raw) return;
  const data = JSON.parse(raw);
  allLearners = data.map(d => new Learner(d.name, d.s1, d.s2, d.s3, d.attend));
  renderStudents();
}

function renderStudents() {
  countBadge.textContent = `${allLearners.length} طالب`;
  if (allLearners.length === 0) {
    boxStudents.innerHTML = "لسه مفيش طلاب متسجلين.";
    return;
  }
  boxStudents.innerHTML = `
    <table class="table table-striped">
      <thead><tr><th>#</th><th>الاسم</th><th>المتوسط</th><th>الحضور</th><th>الحالة</th></tr></thead>
      <tbody>
        ${allLearners.map((l, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><b>${l.fullName}</b></td>
            <td>${l.calcAvg().toFixed(2)}</td>
            <td>${l.attend}%</td>
            <td>${l.calcStatus()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

document.getElementById("btnSave").addEventListener("click", () => {
  try {
    hideMsg();
    const learner = new Learner(txtName.value, txtSub1.value, txtSub2.value, txtSub3.value, txtAttend.value);
    allLearners.push(learner);
    saveToStorage();
    renderStudents();
    txtName.value = ""; txtSub1.value = ""; txtSub2.value = ""; txtSub3.value = ""; txtAttend.value = "";
    txtName.focus();
  } catch (err) {
    showMsg(err.message);
  }
});

document.getElementById("btnRaafa").addEventListener("click", () => {
  const needHelp = allLearners.filter(l => l.calcAvg() >= 40 && l.calcAvg() <= 49);
  if (needHelp.length === 0) {
    boxReport.innerHTML = `<div class="alert alert-info">مفيش حد محتاج رأفة دلوقتي.</div>`;
    return;
  }
  const afterHelp = needHelp.map(l => l.calcAvg() + 5);
  const sum = afterHelp.reduce((acc, cur) => acc + cur, 0);
  const finalAvg = needHelp.length > 0 ? sum / needHelp.length : 0;
  boxReport.innerHTML = `
    <div class="alert alert-warning">
      <h5>تقرير لجنة الرأفة</h5>
      <p><b>عدد المستفيدين:</b> ${needHelp.length} طالب</p>
      <p><b>الأسماء:</b> ${needHelp.map(l => l.fullName).join(" ، ")}</p>
      <p><b>المتوسط العام بعد الرأفة:</b> ${finalAvg.toFixed(2)}</p>
      <hr>
      <ul>
        ${needHelp.map((l, i) => `<li>${l.fullName} : ${l.calcAvg().toFixed(2)} ← ${afterHelp[i].toFixed(2)}</li>`).join("")}
      </ul>
    </div>
  `;
});

loadFromStorage();