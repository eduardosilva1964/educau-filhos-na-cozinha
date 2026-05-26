import { useState, useMemo, useRef, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc, setDoc } from "firebase/firestore";

// ─── TEMA RÚSTICO QUENTE ──────────────────────────────────────────────────────
const T = {
  bg:        "#f7f0e6",
  bgCard:    "#fffdf8",
  bgMuted:   "#f0e8dc",
  header:    "#2c1a0e",
  headerSub: "#3d2510",
  accent:    "#a0522d",
  accentLt:  "#d4a56a",
  accentPale:"#f5e6c8",
  text:      "#2c1a0e",
  textMid:   "#5a3e28",
  textSoft:  "#8a7060",
  textFaint: "#b09070",
  border:    "#e0cebb",
  borderMid: "#d9c9b8",
  notesBg:   "#fff8ee",
  notesBdr:  "#f0d9a8",
  font:      "'Lora', Georgia, serif",
  fontDisplay:"'Playfair Display', Georgia, serif",
};

const complexityColors = {
  fácil:  { bg:"#d4f0e0", text:"#1a7a45", border:"#a3d9bc" },
  médio:  { bg:"#fff3cd", text:"#856404", border:"#ffd97d" },
  difícil:{ bg:"#fde8e8", text:"#a02020", border:"#f4a8a8" },
};
const categoryIcons = { "Entrada":"🥗","Prato Principal":"🍽️","Sobremesa":"🍰","Lanche":"🥪","Bebida":"🥤","Outro":"🍴" };

const initialRecipes = [
  { id:1, name:"Bolo de Cenoura com Cobertura de Chocolate", category:"Sobremesa", complexity:"fácil", time:60, servings:10, tested:true, photo:null, fonte:"Receita da família",
    ingredients:["3 cenouras médias","3 ovos","1 xícara de óleo","2 xícaras de açúcar","2 xícaras de farinha","1 colher de fermento","200g de chocolate meio amargo","1 caixinha de creme de leite"],
    steps:["Bata no liquidificador as cenouras, ovos e óleo.","Adicione o açúcar e bata mais um pouco.","Misture a farinha e o fermento com uma espátula.","Asse em forma untada a 180°C por 40 min.","Derreta o chocolate com o creme de leite e despeje sobre o bolo frio."],
    notes:"Receita da vovó — sucesso garantido!", dica:"Bater bem no liquidificador garante a cenoura completamente dissolvida." },
  { id:2, name:"Risoto de Cogumelos", category:"Prato Principal", complexity:"médio", time:45, servings:4, tested:true, photo:null, fonte:"Receita da família",
    ingredients:["300g de arroz arbóreo","200g de cogumelos frescos","1 cebola","2 dentes de alho","1 taça de vinho branco","1L de caldo de legumes quente","50g de parmesão","2 colheres de manteiga"],
    steps:["Refogue a cebola e o alho na manteiga.","Adicione os cogumelos e refogue até dourar.","Acrescente o arroz e frite por 2 min.","Adicione o vinho e mexa até absorver.","Adicione o caldo concha a concha, mexendo sempre.","Finalize com manteiga e parmesão."],
    notes:"Use caldo quente — é o segredo do risoto cremoso.", dica:"Adicione manteiga gelada no final fora do fogo para o risoto ficar extra cremoso." },
  { id:3, name:"Strogonoff de Frango", category:"Prato Principal", complexity:"fácil", time:35, servings:6, tested:false, photo:null, fonte:"Inspiração dos filhos",
    ingredients:["1kg de peito de frango em cubos","1 cebola picada","2 dentes de alho","1 lata de molho de tomate","1 lata de creme de leite","2 colheres de ketchup","1 colher de mostarda","Champignon a gosto"],
    steps:["Tempere o frango com sal, alho e pimenta.","Frite o frango até dourar.","Adicione a cebola e o champignon.","Junte o molho de tomate, ketchup e mostarda.","Cozinhe por 10 min e finalize com o creme de leite."],
    notes:"", dica:"" },
  { id:4, name:"Macarons de Baunilha", category:"Sobremesa", complexity:"difícil", time:120, servings:30, tested:false, photo:null, fonte:"Inspiração dos filhos",
    ingredients:["150g de farinha de amêndoas","150g de açúcar de confeiteiro","55g de claras envelhecidas (para a massa)","55g de claras envelhecidas (para o merengue)","150g de açúcar","50ml de água","Extrato de baunilha"],
    steps:["Penere a farinha de amêndoas com o açúcar de confeiteiro.","Prepare o merengue italiano.","Misture as claras cruas na farinha de amêndoas.","Incorpore o merengue com movimentos envolventes (macaronage).","Forme os discos e deixe secar por 30 min.","Asse a 150°C por 13 min.","Recheie com ganache de baunilha."],
    notes:"Umidade é inimiga. Não faça em dia chuvoso!", dica:"Envelheça as claras na geladeira por 48h descobertas para macarons perfeitos." },
  { id:5, name:"Salada Caprese", category:"Entrada", complexity:"fácil", time:10, servings:4, tested:true, photo:null, fonte:"Receita da família",
    ingredients:["3 tomates maduros","250g de mussarela de búfala","Folhas de manjericão fresco","Azeite extra virgem","Sal e pimenta-do-reino","Redução de balsâmico"],
    steps:["Fatie os tomates e a mussarela em rodelas.","Monte intercalando tomate, mussarela e manjericão.","Regue com azeite e tempere.","Finalize com a redução de balsâmico."],
    notes:"Use ingredientes de boa qualidade — faz toda a diferença.", dica:"Escorra a mussarela de búfala antes de servir para não encharcar o prato." },
  { id:6, name:"Costelinha ao Barbecue (forno lento)", category:"Prato Principal", complexity:"médio", time:210, servings:4, tested:false, photo:null, fonte:"Inspiração dos filhos",
    ingredients:["1,5kg de costelinha suína","Sal, pimenta, páprica defumada","1 xícara de molho barbecue","2 colheres de mel","Suco de 1 limão","Alho em pó"],
    steps:["Tempere a costelinha e deixe marinar por 2h.","Embrulhe em papel alumínio.","Asse a 160°C por 3 horas.","Abra o papel, pincele com barbecue e mel.","Aumente para 220°C e asse mais 15 min para caramelizar."],
    notes:"Quanto mais tempo baixo, mais macia fica.", dica:"Retire a membrana da parte de baixo da costelinha antes de temperar." },
];

function timeLabel(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min/60), m = min%60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── LISTA DE COMPRAS MODAL ───────────────────────────────────────────────────
function ShoppingListModal({ recipes, onClose }) {
  const [selected, setSelected] = useState(() => new Set(recipes.map(r=>r.id)));
  const [checked, setChecked] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const toggleRecipe = (id) => setSelected(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const allIngredients = useMemo(() => {
    const map = {};
    recipes.filter(r => selected.has(r.id)).forEach(r => {
      r.ingredients.forEach(ing => {
        const key = ing.toLowerCase().trim();
        if (!map[key]) map[key] = { text: ing, recipes: [] };
        map[key].recipes.push(r.name);
      });
    });
    return Object.values(map);
  }, [recipes, selected]);

  const toggleItem = (idx) => setChecked(prev => {
    const s = new Set(prev);
    s.has(idx) ? s.delete(idx) : s.add(idx);
    return s;
  });

  const remaining = allIngredients.filter((_,i) => !checked.has(i)).length;

  const selectedRecipeNames = recipes.filter(r=>selected.has(r.id)).map(r=>r.name);
  const shareText =
    `🛒 *Lista de Compras*\n` +
    `_Educau & Filhos na Cozinha_\n\n` +
    (selectedRecipeNames.length > 0 ? `📋 Receitas: ${selectedRecipeNames.join(", ")}\n\n` : "") +
    allIngredients.map((item,i) => `${checked.has(i)?"✅":"◻️"} ${item.text}`).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500); });
  };
  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`,"_blank");

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(20,14,8,0.75)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:T.bgCard,borderRadius:20,maxWidth:500,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)",fontFamily:T.font }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:T.header,padding:"22px 28px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11,letterSpacing:3,color:T.accentLt,textTransform:"uppercase",marginBottom:4 }}>Educau & Filhos na Cozinha</div>
            <h2 style={{ margin:0,color:"#fff",fontSize:"1.15rem" }}>🛒 Lista de Compras</h2>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"20px 24px" }}>
          {/* Recipe selector */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:0.5,textTransform:"uppercase",marginBottom:10 }}>
              Selecione as receitas
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {recipes.map(r => (
                <label key={r.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:selected.has(r.id)?T.bgMuted:"transparent",border:`1px solid ${selected.has(r.id)?T.border:"transparent"}`,cursor:"pointer",transition:"all 0.15s" }}>
                  <input type="checkbox" checked={selected.has(r.id)} onChange={()=>toggleRecipe(r.id)} style={{ accentColor:T.accent,width:16,height:16 }} />
                  <span style={{ fontSize:13,color:T.text,flex:1 }}>{r.name}</span>
                  <span style={{ fontSize:10,color:T.textSoft }}>{categoryIcons[r.category]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop:`1px solid ${T.border}`,marginBottom:16 }} />

          {/* Ingredient list header */}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
            <div style={{ fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:0.5,textTransform:"uppercase" }}>
              {allIngredients.length} ingredientes
            </div>
            <div style={{ fontSize:12,color:T.textSoft }}>{remaining} restantes</div>
          </div>

          {allIngredients.length === 0 ? (
            <div style={{ textAlign:"center",padding:"24px 0",color:T.textFaint,fontSize:13 }}>Selecione ao menos uma receita</div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
              {allIngredients.map((item, i) => (
                <label key={i} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"9px 12px",borderRadius:10,background:checked.has(i)?"#f8f4f0":T.bgCard,border:`1px solid ${checked.has(i)?T.border:T.borderMid}`,cursor:"pointer",opacity:checked.has(i)?0.5:1,transition:"all 0.15s" }}>
                  <input type="checkbox" checked={checked.has(i)} onChange={()=>toggleItem(i)} style={{ accentColor:T.accent,width:16,height:16,marginTop:2,flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:13,color:T.text,textDecoration:checked.has(i)?"line-through":"none" }}>{item.text}</span>
                    {item.recipes.length > 1 && (
                      <div style={{ fontSize:10,color:T.textSoft,marginTop:2 }}>
                        Usado em: {item.recipes.slice(0,2).join(", ")}{item.recipes.length>2?` +${item.recipes.length-2}`:""}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Share + clear buttons */}
          {allIngredients.length > 0 && (
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:16 }}>
              <button onClick={handleWhatsApp} style={{ width:"100%",padding:"11px",border:"none",borderRadius:12,background:"#25D366",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                <span style={{fontSize:16}}>💬</span> Enviar pelo WhatsApp
              </button>
              <button onClick={handleCopy} style={{ width:"100%",padding:"11px",border:`1.5px solid ${T.border}`,borderRadius:12,background:copied?"#f0faf0":"transparent",color:copied?"#2d6a2d":T.textMid,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.2s" }}>
                <span style={{fontSize:16}}>{copied?"✅":"📋"}</span> {copied?"Copiado!":"Copiar lista"}
              </button>
              <button onClick={()=>setChecked(new Set())} style={{ width:"100%",padding:"9px",border:`1px solid ${T.borderMid}`,borderRadius:12,background:"transparent",color:T.textSoft,cursor:"pointer",fontSize:12,fontFamily:T.font }}>
                Limpar marcações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SHARE MODAL ─────────────────────────────────────────────────────────────
function ShareModal({ recipe, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareText = `🍴 *${recipe.name}*\n\n` +
    `📂 ${recipe.category} · ⏱ ${timeLabel(recipe.time)} · 👥 ${recipe.servings} porções\n\n` +
    `*Ingredientes:*\n${recipe.ingredients.map(i=>`• ${i}`).join("\n")}\n\n` +
    `*Modo de Preparo:*\n${recipe.steps.map((s,i)=>`${i+1}. ${s}`).join("\n")}` +
    (recipe.notes ? `\n\n📝 ${recipe.notes}` : "") +
    `\n\n— Educau & Filhos na Cozinha 🍽️`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(20,14,8,0.75)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:T.bgCard,borderRadius:20,maxWidth:460,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.3)",fontFamily:T.font }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:T.header,padding:"22px 28px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11,letterSpacing:3,color:T.accentLt,textTransform:"uppercase",marginBottom:4 }}>Compartilhar</div>
            <h2 style={{ margin:0,color:"#fff",fontSize:"1.1rem",lineHeight:1.3 }}>{recipe.name}</h2>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px" }}>
          {/* Preview */}
          <div style={{ background:T.bgMuted,borderRadius:12,padding:"14px 16px",marginBottom:20,fontSize:12,color:T.textMid,lineHeight:1.7,maxHeight:160,overflowY:"auto",whiteSpace:"pre-wrap",border:`1px solid ${T.border}` }}>
            {shareText}
          </div>
          {/* Buttons */}
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            <button onClick={handleWhatsApp} style={{ padding:"13px",border:"none",borderRadius:12,background:"#25D366",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              <span style={{ fontSize:18 }}>💬</span> Enviar pelo WhatsApp
            </button>
            <button onClick={handleCopy} style={{ padding:"13px",border:`1.5px solid ${T.border}`,borderRadius:12,background:copied?"#f0faf0":"transparent",color:copied?"#2d6a2d":T.textMid,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s" }}>
              <span style={{ fontSize:18 }}>{copied?"✅":"📋"}</span> {copied?"Copiado!":"Copiar texto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── IMPORT MODAL ─────────────────────────────────────────────────────────────
function ImportModal({ onClose, onImported }) {
  const [mode, setMode] = useState("foto");
  const [stage, setStage] = useState("upload");
  const [pages, setPages] = useState([]);
  const [docFile, setDocFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const photoRef = useRef();
  const docRef = useRef();

  const readImageFile = (file) => new Promise(resolve => {
    const r = new FileReader();
    r.onload = ev => resolve({ preview: ev.target.result, base64: ev.target.result.split(",")[1] });
    r.readAsDataURL(file);
  });
  const readDocFile = (file) => new Promise(resolve => {
    const r = new FileReader();
    r.onload = ev => resolve({ name: file.name, base64: ev.target.result.split(",")[1], type: file.type });
    r.readAsDataURL(file);
  });

  const handleImageFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPages = await Promise.all(files.map(readImageFile));
    setPages(prev => [...prev, ...newPages]);
    photoRef.current.value = "";
  };
  const handleDocFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocFile(await readDocFile(file));
    docRef.current.value = "";
  };
  const removePage = (idx) => setPages(prev => prev.filter((_,i)=>i!==idx));
  const movePage = (idx, dir) => {
    setPages(prev => {
      const arr=[...prev], t=idx+dir;
      if(t<0||t>=arr.length) return arr;
      [arr[idx],arr[t]]=[arr[t],arr[idx]];
      return arr;
    });
  };

  const JSON_PROMPT = `Responda SOMENTE com JSON válido, sem markdown, sem backticks:\n{"name":"","category":"Prato Principal","complexity":"fácil","time":30,"servings":4,"ingredients":[],"steps":[],"notes":""}\ncategory: Entrada/Prato Principal/Sobremesa/Lanche/Bebida/Outro. complexity: fácil/médio/difícil. time em minutos (inteiro). servings inteiro.`;

  const sanitize = r => {
    r.id=Date.now(); r.tested=false; r.photo=null; r.fonte=""; r.dica="";
    r.time=parseInt(r.time)||30; r.servings=parseInt(r.servings)||4;
    if(!Array.isArray(r.ingredients)) r.ingredients=[];
    if(!Array.isArray(r.steps)) r.steps=[];
    if(!["fácil","médio","difícil"].includes(r.complexity)) r.complexity="médio";
    if(!["Entrada","Prato Principal","Sobremesa","Lanche","Bebida","Outro"].includes(r.category)) r.category="Outro";
    return r;
  };

  const callAPI = async (content) => {
    const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1500,messages:[{role:"user",content}]})});
    const data = await res.json();
    if(data.error) throw new Error(`API error: ${data.error.type} — ${data.error.message}`);
    const raw = data.content.map(b=>b.text||"").join("").trim();
    try {
      return JSON.parse(raw.replace(/```json|```/g,"").trim());
    } catch(e) {
      throw new Error(`JSON inválido: ${raw.slice(0,200)}`);
    }
  };

  const handleAnalyze = async () => {
    setStage("reading");
    try {
      let result;
      if(mode==="foto") {
        const blocks = pages.map(p=>({type:"image",source:{type:"base64",media_type:"image/jpeg",data:p.base64}}));
        result = await callAPI([...blocks,{type:"text",text:`Analise as ${pages.length} imagens de uma mesma receita e combine o conteúdo.\n${JSON_PROMPT}`}]);
      } else if(mode==="pdf") {
        result = await callAPI([{type:"document",source:{type:"base64",media_type:"application/pdf",data:docFile.base64}},{type:"text",text:`Extraia a receita deste PDF.\n${JSON_PROMPT}`}]);
      } else {
        const mammoth = await import("mammoth");
        const arrayBuffer = await fetch(`data:${docFile.type};base64,${docFile.base64}`).then(r=>r.arrayBuffer());
        const {value:docText} = await mammoth.extractRawText({arrayBuffer});
        result = await callAPI([{type:"text",text:`Extraia a receita do texto abaixo.\n${JSON_PROMPT}\n\n${docText}`}]);
      }
      setParsed(sanitize(result));
      setStage("review");
    } catch(err) {
      setErrorMsg(err.message || (mode==="foto"?"Tente fotos mais nítidas e bem iluminadas.":mode==="pdf"?"Verifique se o PDF tem texto selecionável.":"Verifique se é um arquivo .docx válido."));
      setStage("error");
    }
  };

  const canAnalyze = mode==="foto" ? pages.length>0 : !!docFile;
  const modeLabel = mode==="foto" ? `${pages.length} foto${pages.length!==1?"s":""}` : docFile?.name||"arquivo";

  const fs={width:"100%",padding:"9px 12px",border:`1px solid ${T.borderMid}`,borderRadius:8,fontSize:13,color:T.text,background:T.bgCard,boxSizing:"border-box",fontFamily:T.font,outline:"none"};
  const Lbl=({children})=><label style={{display:"block",fontSize:11,fontWeight:700,color:T.textMid,marginBottom:5,letterSpacing:0.5,textTransform:"uppercase"}}>{children}</label>;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(20,14,8,0.78)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:T.bgCard,borderRadius:20,maxWidth:500,width:"100%",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.35)",fontFamily:T.font}} onClick={e=>e.stopPropagation()}>
        <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.2);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{background:T.header,padding:"22px 28px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,letterSpacing:3,color:T.accentLt,textTransform:"uppercase",marginBottom:4}}>Importar via IA</div>
            <h2 style={{margin:0,color:"#fff",fontSize:"1.15rem"}}>📥 Importar Receita</h2>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18}}>×</button>
        </div>

        {stage==="upload" && (
          <div style={{display:"flex",background:T.headerSub,borderBottom:`1px solid rgba(255,255,255,0.08)`}}>
            {[{id:"foto",icon:"📷",label:"Fotos"},{id:"pdf",icon:"📄",label:"PDF"},{id:"word",icon:"📝",label:"Word"}].map(t=>(
              <button key={t.id} onClick={()=>{setMode(t.id);setPages([]);setDocFile(null);}} style={{flex:1,padding:"12px 6px",border:"none",background:"transparent",cursor:"pointer",color:mode===t.id?T.accentLt:T.textSoft,borderBottom:mode===t.id?`2px solid ${T.accentLt}`:"2px solid transparent",fontFamily:T.font,fontSize:13,fontWeight:mode===t.id?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.15s"}}>
                <span style={{fontSize:18}}>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{padding:"24px 28px"}}>
          {/* UPLOAD: FOTO */}
          {stage==="upload" && mode==="foto" && (
            <div>
              <p style={{color:T.textMid,fontSize:14,lineHeight:1.6,marginTop:0,marginBottom:16}}>Adicione <strong>uma ou mais fotos</strong> — frente, verso, quantas páginas precisar.</p>
              <input ref={photoRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleImageFiles}/>
              {pages.length>0 && (
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:0.5,textTransform:"uppercase",marginBottom:10}}>{pages.length} página{pages.length>1?"s":""}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {pages.map((p,i)=>(
                      <div key={i} style={{display:"flex",gap:10,alignItems:"center",background:T.bgMuted,borderRadius:12,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                        <img src={p.preview} alt="" style={{width:56,height:56,objectFit:"cover",borderRadius:8,flexShrink:0,border:`1px solid ${T.borderMid}`}}/>
                        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.text}}>Página {i+1}</div><div style={{fontSize:11,color:T.textSoft,marginTop:2}}>{i===0?"Primeira":i===pages.length-1?"Última":"Meio"}</div></div>
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                          <button onClick={()=>movePage(i,-1)} disabled={i===0} style={{width:26,height:26,border:`1px solid ${T.borderMid}`,borderRadius:6,background:i===0?T.bgMuted:"#fff",color:i===0?T.textFaint:T.textMid,cursor:i===0?"default":"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
                          <button onClick={()=>movePage(i,1)} disabled={i===pages.length-1} style={{width:26,height:26,border:`1px solid ${T.borderMid}`,borderRadius:6,background:i===pages.length-1?T.bgMuted:"#fff",color:i===pages.length-1?T.textFaint:T.textMid,cursor:i===pages.length-1?"default":"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>↓</button>
                          <button onClick={()=>removePage(i)} style={{width:26,height:26,border:"1px solid #f4a8a8",borderRadius:6,background:"#fde8e8",color:"#a02020",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={()=>photoRef.current.click()} style={{width:"100%",padding:pages.length?"13px":"28px 16px",border:`2px dashed ${pages.length?"#c8b8a8":"#c0b0a0"}`,borderRadius:14,background:pages.length?T.bgMuted:T.bg,cursor:"pointer",marginBottom:12,display:"flex",flexDirection:"column",alignItems:"center",gap:pages.length?3:8,fontFamily:T.font}}>
                <span style={{fontSize:pages.length?18:36}}>📷</span>
                <span style={{fontSize:pages.length?12:14,color:T.accent,fontWeight:700}}>{pages.length?"+ Adicionar mais páginas":"Escolher foto(s) da receita"}</span>
                {!pages.length&&<span style={{fontSize:11,color:T.textSoft}}>💡 Boa iluminação = melhor resultado</span>}
              </button>
            </div>
          )}

          {/* UPLOAD: PDF */}
          {stage==="upload" && mode==="pdf" && (
            <div>
              <p style={{color:T.textMid,fontSize:14,lineHeight:1.6,marginTop:0,marginBottom:16}}>Envie um <strong>PDF</strong> com a receita. Funciona melhor com PDFs de texto digitado.</p>
              <input ref={docRef} type="file" accept=".pdf,application/pdf" style={{display:"none"}} onChange={handleDocFile}/>
              {docFile ? (
                <div style={{display:"flex",gap:12,alignItems:"center",background:T.bgMuted,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.border}`,marginBottom:12}}>
                  <span style={{fontSize:32,flexShrink:0}}>📄</span>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{docFile.name}</div><div style={{fontSize:11,color:"#2d6a2d",marginTop:2}}>PDF carregado ✓</div></div>
                  <button onClick={()=>setDocFile(null)} style={{width:28,height:28,border:"1px solid #f4a8a8",borderRadius:6,background:"#fde8e8",color:"#a02020",cursor:"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              ) : (
                <button onClick={()=>docRef.current.click()} style={{width:"100%",padding:"28px 16px",border:`2px dashed ${T.borderMid}`,borderRadius:14,background:T.bg,cursor:"pointer",marginBottom:12,display:"flex",flexDirection:"column",alignItems:"center",gap:8,fontFamily:T.font}}>
                  <span style={{fontSize:36}}>📄</span>
                  <span style={{fontSize:14,color:T.accent,fontWeight:700}}>Escolher arquivo PDF</span>
                </button>
              )}
            </div>
          )}

          {/* UPLOAD: WORD */}
          {stage==="upload" && mode==="word" && (
            <div>
              <p style={{color:T.textMid,fontSize:14,lineHeight:1.6,marginTop:0,marginBottom:16}}>Envie um arquivo <strong>Word (.docx)</strong> com a receita.</p>
              <input ref={docRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{display:"none"}} onChange={handleDocFile}/>
              {docFile ? (
                <div style={{display:"flex",gap:12,alignItems:"center",background:T.bgMuted,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.border}`,marginBottom:12}}>
                  <span style={{fontSize:32,flexShrink:0}}>📝</span>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{docFile.name}</div><div style={{fontSize:11,color:"#2d6a2d",marginTop:2}}>Word carregado ✓</div></div>
                  <button onClick={()=>setDocFile(null)} style={{width:28,height:28,border:"1px solid #f4a8a8",borderRadius:6,background:"#fde8e8",color:"#a02020",cursor:"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              ) : (
                <button onClick={()=>docRef.current.click()} style={{width:"100%",padding:"28px 16px",border:`2px dashed ${T.borderMid}`,borderRadius:14,background:T.bg,cursor:"pointer",marginBottom:12,display:"flex",flexDirection:"column",alignItems:"center",gap:8,fontFamily:T.font}}>
                  <span style={{fontSize:36}}>📝</span>
                  <span style={{fontSize:14,color:T.accent,fontWeight:700}}>Escolher arquivo Word (.docx)</span>
                </button>
              )}
            </div>
          )}

          {stage==="upload" && canAnalyze && (
            <button onClick={handleAnalyze} style={{width:"100%",padding:14,border:"none",borderRadius:12,background:T.header,color:T.accentLt,cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:T.font,letterSpacing:0.5,marginTop:4}}>
              ✨ Analisar {modeLabel} com IA
            </button>
          )}

          {stage==="reading" && (
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{fontSize:52,marginBottom:16}}>🔍</div>
              <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:8}}>Analisando {modeLabel}...</div>
              <div style={{fontSize:13,color:T.textSoft,lineHeight:1.7}}>A IA está lendo e extraindo a receita completa.</div>
              <div style={{marginTop:24,display:"flex",justifyContent:"center",gap:6}}>
                {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.accent,animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}
              </div>
            </div>
          )}

          {stage==="error" && (
            <div style={{textAlign:"center",padding:"32px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>😕</div>
              <div style={{fontSize:15,fontWeight:700,color:"#a02020",marginBottom:8}}>Não consegui ler</div>
              <div style={{fontSize:13,color:T.textSoft,lineHeight:1.7,marginBottom:24}}>{errorMsg}</div>
              <button onClick={()=>setStage("upload")} style={{padding:"11px 28px",border:"none",borderRadius:12,background:T.header,color:T.accentLt,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:T.font}}>Tentar novamente</button>
            </div>
          )}

          {stage==="review" && parsed && (
            <div>
              <div style={{background:"#f4faf4",border:"1px solid #b8d8b8",borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#2a5a2a"}}>✅ Receita extraída! Revise antes de salvar.</div>
              <div style={{marginBottom:14}}><Lbl>Nome</Lbl><input value={parsed.name} onChange={e=>setParsed({...parsed,name:e.target.value})} style={fs}/></div>
              <div style={{marginBottom:14}}><Lbl>Fonte / Inspiração</Lbl><input value={parsed.fonte||""} onChange={e=>setParsed({...parsed,fonte:e.target.value})} placeholder="Ex: Vovó, Livro da Ana Maria, Instagram..." style={fs}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div><Lbl>Categoria</Lbl><select value={parsed.category} onChange={e=>setParsed({...parsed,category:e.target.value})} style={fs}>{["Entrada","Prato Principal","Sobremesa","Lanche","Bebida","Outro"].map(c=><option key={c}>{c}</option>)}</select></div>
                <div><Lbl>Complexidade</Lbl><select value={parsed.complexity} onChange={e=>setParsed({...parsed,complexity:e.target.value})} style={fs}><option value="fácil">Fácil</option><option value="médio">Médio</option><option value="difícil">Difícil</option></select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div><Lbl>Tempo (min)</Lbl><input type="number" value={parsed.time} onChange={e=>setParsed({...parsed,time:parseInt(e.target.value)||0})} style={fs}/></div>
                <div><Lbl>Porções</Lbl><input type="number" value={parsed.servings} onChange={e=>setParsed({...parsed,servings:parseInt(e.target.value)||1})} style={fs}/></div>
              </div>
              <div style={{marginBottom:14}}><Lbl>Ingredientes (um por linha)</Lbl><textarea rows={5} value={parsed.ingredients.join("\n")} onChange={e=>setParsed({...parsed,ingredients:e.target.value.split("\n").map(s=>s.trim()).filter(Boolean)})} style={{...fs,resize:"vertical",lineHeight:1.6}}/></div>
              <div style={{marginBottom:14}}><Lbl>Modo de Preparo (um passo por linha)</Lbl><textarea rows={6} value={parsed.steps.join("\n")} onChange={e=>setParsed({...parsed,steps:e.target.value.split("\n").map(s=>s.trim()).filter(Boolean)})} style={{...fs,resize:"vertical",lineHeight:1.6}}/></div>
              <div style={{marginBottom:20}}><Lbl>Notas</Lbl><textarea rows={2} value={parsed.notes} onChange={e=>setParsed({...parsed,notes:e.target.value})} style={{...fs,resize:"vertical",lineHeight:1.6}}/></div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setStage("upload")} style={{flex:1,padding:"12px",border:`1px solid ${T.borderMid}`,borderRadius:12,background:"transparent",color:T.textSoft,cursor:"pointer",fontSize:13,fontFamily:T.font}}>← Refazer</button>
                <button onClick={()=>{onImported(parsed);onClose();}} style={{flex:2,padding:"12px",border:"none",borderRadius:12,background:T.header,color:T.accentLt,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:T.font}}>💾 Salvar Receita</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RECIPE SHOPPING TAB ─────────────────────────────────────────────────────
function RecipeShoppingTab({ recipe }) {
  const [checked, setChecked] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const toggle = (i) => setChecked(prev => {
    const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s;
  });

  const remaining = recipe.ingredients.filter((_,i) => !checked.has(i)).length;

  const shareText =
    `🛒 *Lista de Compras — ${recipe.name}*\n` +
    `_Educau & Filhos na Cozinha_\n\n` +
    recipe.ingredients.map((ing,i) => `${checked.has(i)?"✅":"◻️"} ${ing}`).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500); });
  };
  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`,"_blank");

  return (
    <div>
      {/* Counter */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:0.5,textTransform:"uppercase"}}>
          {recipe.ingredients.length} ingredientes
        </div>
        <div style={{fontSize:12,color:T.textSoft}}>{remaining} restantes</div>
      </div>

      {/* Ingredient checklist */}
      <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16}}>
        {recipe.ingredients.map((ing,i) => (
          <label key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:checked.has(i)?"#f8f4f0":T.bgCard,border:`1px solid ${checked.has(i)?T.border:T.borderMid}`,cursor:"pointer",opacity:checked.has(i)?0.5:1,transition:"all 0.15s"}}>
            <input type="checkbox" checked={checked.has(i)} onChange={()=>toggle(i)} style={{accentColor:T.accent,width:16,height:16,flexShrink:0}}/>
            <span style={{fontSize:13,color:T.text,textDecoration:checked.has(i)?"line-through":"none"}}>{ing}</span>
          </label>
        ))}
      </div>

      {/* Share buttons */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <button onClick={handleWhatsApp} style={{width:"100%",padding:"11px",border:"none",borderRadius:12,background:"#25D366",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <span style={{fontSize:16}}>💬</span> Enviar pelo WhatsApp
        </button>
        <button onClick={handleCopy} style={{width:"100%",padding:"11px",border:`1.5px solid ${T.border}`,borderRadius:12,background:copied?"#f0faf0":"transparent",color:copied?"#2d6a2d":T.textMid,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.2s"}}>
          <span style={{fontSize:16}}>{copied?"✅":"📋"}</span> {copied?"Copiado!":"Copiar lista"}
        </button>
        {checked.size > 0 && (
          <button onClick={()=>setChecked(new Set())} style={{width:"100%",padding:"9px",border:`1px solid ${T.borderMid}`,borderRadius:12,background:"transparent",color:T.textSoft,cursor:"pointer",fontSize:12,fontFamily:T.font}}>
            Limpar marcações
          </button>
        )}
      </div>
    </div>
  );
}

// ─── EDIT RECIPE MODAL ───────────────────────────────────────────────────────
function EditRecipeModal({ recipe, onClose, onSave }) {
  const [form, setForm] = useState({
    ...recipe,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join("\n") : "",
    steps: Array.isArray(recipe.steps) ? recipe.steps.join("\n") : "",
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const photoInputRef = useRef();

  const handleSave = () => {
    if(!form.name.trim()) return;
    onSave({
      ...form,
      time: parseInt(form.time)||0,
      servings: parseInt(form.servings)||1,
      ingredients: form.ingredients.split("\n").map(s=>s.trim()).filter(Boolean),
      steps: form.steps.split("\n").map(s=>s.trim()).filter(Boolean),
    });
    onClose();
  };

  const s={width:"100%",padding:"10px 14px",border:`1px solid ${T.borderMid}`,borderRadius:10,fontSize:14,color:T.text,background:T.bgCard,boxSizing:"border-box",fontFamily:T.font,outline:"none"};
  const L=({children})=><label style={{display:"block",fontSize:12,fontWeight:700,color:T.textMid,marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"}}>{children}</label>;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(20,14,8,0.78)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:T.bgCard,borderRadius:20,maxWidth:500,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)",fontFamily:T.font}} onClick={e=>e.stopPropagation()}>
        <div style={{background:T.header,padding:"24px 28px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,color:T.accentLt,fontSize:"1.2rem"}}>✏️ Editar Receita</h2>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18}}>×</button>
        </div>
        <div style={{padding:"24px 28px"}}>
          <div style={{marginBottom:16}}><L>Nome</L><input value={form.name} onChange={e=>set("name",e.target.value)} style={s}/></div>
          <div style={{marginBottom:16}}><L>Fonte / Inspiração</L><input value={form.fonte||""} onChange={e=>set("fonte",e.target.value)} placeholder="Ex: Vovó, Livro, Instagram..." style={s}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><L>Categoria</L><select value={form.category} onChange={e=>set("category",e.target.value)} style={{...s,fontSize:13}}>{["Entrada","Prato Principal","Sobremesa","Lanche","Bebida","Outro"].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><L>Complexidade</L><select value={form.complexity} onChange={e=>set("complexity",e.target.value)} style={{...s,fontSize:13}}><option value="fácil">Fácil</option><option value="médio">Médio</option><option value="difícil">Difícil</option></select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><L>Tempo (min)</L><input type="number" value={form.time} onChange={e=>set("time",e.target.value)} style={s}/></div>
            <div><L>Porções</L><input type="number" value={form.servings} onChange={e=>set("servings",e.target.value)} style={s}/></div>
          </div>
          <div style={{marginBottom:16}}><L>Ingredientes (um por linha)</L><textarea value={form.ingredients} onChange={e=>set("ingredients",e.target.value)} rows={5} style={{...s,fontSize:13,resize:"vertical",lineHeight:1.6}}/></div>
          <div style={{marginBottom:16}}><L>Modo de Preparo (um passo por linha)</L><textarea value={form.steps} onChange={e=>set("steps",e.target.value)} rows={5} style={{...s,fontSize:13,resize:"vertical",lineHeight:1.6}}/></div>
          <div style={{marginBottom:16}}><L>Notas</L><textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={2} style={{...s,fontSize:13,resize:"vertical",lineHeight:1.6}}/></div>
          <div style={{marginBottom:20}}>
            <L>💡 Pulo do gato</L>
            <textarea value={form.dica||""} onChange={e=>set("dica",e.target.value)} rows={2} placeholder="O segredo que faz toda a diferença..." style={{...s,fontSize:13,resize:"vertical",lineHeight:1.6,borderColor:form.dica?T.accentLt:undefined,background:form.dica?"#fff8ee":undefined}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"12px",border:`1px solid ${T.borderMid}`,borderRadius:12,background:"transparent",color:T.textSoft,cursor:"pointer",fontSize:14,fontFamily:T.font}}>Cancelar</button>
            <button onClick={handleSave} style={{flex:2,padding:"12px",border:"none",borderRadius:12,background:T.header,color:T.accentLt,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:T.font}}>💾 Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RECIPE DETAIL MODAL ──────────────────────────────────────────────────────
function RecipeModal({ recipe, onClose, onUpdate, onShare, onEdit }) {
  const [activeTab, setActiveTab] = useState("ingredientes");
  const [photo, setPhoto] = useState(recipe.photo||null);
  const [tested, setTested] = useState(recipe.tested||false);
  const photoInputRef = useRef();
  if(!recipe) return null;
  const col = complexityColors[recipe.complexity];
  const handlePhotoChange = val => { setPhoto(val); onUpdate({...recipe,photo:val,tested}); };
  const handleTestedToggle = () => { const v=!tested; setTested(v); onUpdate({...recipe,photo,tested:v}); };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(20,14,8,0.72)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:T.bgCard,borderRadius:20,maxWidth:520,width:"100%",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)",fontFamily:T.font}} onClick={e=>e.stopPropagation()}>
        {photo && (
          <div style={{position:"relative"}}>
            <img src={photo} alt="" style={{width:"100%",height:200,objectFit:"cover",borderRadius:"20px 20px 0 0",display:"block"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(20,10,4,0.7) 100%)",borderRadius:"20px 20px 0 0"}}/>
          </div>
        )}
        <div style={{background:photo?"transparent":T.header,marginTop:photo?-60:0,padding:"28px 28px 20px",borderRadius:photo?0:"20px 20px 0 0",position:"relative",zIndex:1}}>
          <div style={{position:"absolute",top:photo?8:12,right:12,display:"flex",gap:6,zIndex:2}}>
            <button onClick={()=>onEdit(recipe)} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:20,padding:"6px 10px",cursor:"pointer",color:"#fff",fontSize:12,fontFamily:T.font,display:"flex",alignItems:"center",gap:3}}>
              ✏️
            </button>
            <button onClick={()=>onShare(recipe)} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:20,padding:"6px 10px",cursor:"pointer",color:"#fff",fontSize:12,fontFamily:T.font,display:"flex",alignItems:"center",gap:3}}>
              ↗
            </button>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
          <div style={{fontSize:11,color:T.accentLt,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{categoryIcons[recipe.category]||"🍴"} {recipe.category}{recipe.fonte ? ` · ${recipe.fonte}` : ""}</div>
          <h2 style={{margin:0,color:"#fff",fontSize:"1.4rem",lineHeight:1.3,fontWeight:700}}>{recipe.name}</h2>
          <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{background:col.bg,color:col.text,border:`1px solid ${col.border}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>{recipe.complexity.charAt(0).toUpperCase()+recipe.complexity.slice(1)}</span>
            <span style={{background:"rgba(255,255,255,0.12)",color:"#e8d5b7",borderRadius:20,padding:"4px 12px",fontSize:12}}>⏱ {timeLabel(recipe.time)}</span>
            <span style={{background:"rgba(255,255,255,0.12)",color:"#e8d5b7",borderRadius:20,padding:"4px 12px",fontSize:12}}>👥 {recipe.servings} porções</span>
            <button onClick={handleTestedToggle} style={{background:tested?"#2d6a2d":"rgba(255,255,255,0.12)",color:tested?"#b8f0b8":"#e8d5b7",border:tested?"1px solid #4a9a4a":"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 12px",fontSize:12,cursor:"pointer",fontFamily:T.font,fontWeight:tested?700:400}}>
              {tested?"✅ Testada":"○ Não testada"}
            </button>
          </div>
        </div>
        <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,background:T.bgMuted}}>
          {["ingredientes","modo de preparo","🛒 compras","foto"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{flex:1,padding:"12px 2px",border:"none",background:"transparent",cursor:"pointer",fontSize:11,fontWeight:activeTab===tab?700:400,color:activeTab===tab?T.text:T.textSoft,borderBottom:activeTab===tab?`2px solid ${T.accent}`:"2px solid transparent",fontFamily:T.font,textTransform:"capitalize",letterSpacing:0.2}}>{tab}</button>
          ))}
        </div>
        <div style={{padding:"24px 28px"}}>
          {activeTab==="ingredientes" && (
            <ul style={{listStyle:"none",margin:0,padding:0}}>
              {recipe.ingredients.map((ing,i)=>(
                <li key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:i<recipe.ingredients.length-1?`1px solid ${T.bgMuted}`:"none",fontSize:"0.95rem",color:T.text}}>
                  <span style={{color:T.accent,marginTop:2,flexShrink:0}}>◆</span>{ing}
                </li>
              ))}
            </ul>
          )}
          {activeTab==="modo de preparo" && (
            <ol style={{margin:0,padding:0,listStyle:"none"}}>
              {recipe.steps.map((step,i)=>(
                <li key={i} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
                  <span style={{background:T.header,color:T.accentLt,borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</span>
                  <span style={{color:T.text,fontSize:"0.95rem",lineHeight:1.6,paddingTop:3}}>{step}</span>
                </li>
              ))}
            </ol>
          )}
          {activeTab==="🛒 compras" && (
            <RecipeShoppingTab recipe={recipe} />
          )}
          {activeTab==="foto" && (
            <div>
              <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>handlePhotoChange(ev.target.result);r.readAsDataURL(f);}}/>
              {photo ? (
                <div style={{position:"relative"}}>
                  <img src={photo} alt="" style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:12,display:"block"}}/>
                  <button onClick={()=>handlePhotoChange(null)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:14}}>×</button>
                  <button onClick={()=>photoInputRef.current.click()} style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#fff",fontSize:11}}>Trocar foto</button>
                </div>
              ) : (
                <button onClick={()=>photoInputRef.current.click()} style={{width:"100%",padding:18,border:`2px dashed ${T.borderMid}`,borderRadius:12,background:T.bgMuted,cursor:"pointer",color:T.textSoft,fontSize:13,display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:T.font}}>
                  <span style={{fontSize:28}}>📷</span><span>Adicionar foto do prato</span>
                </button>
              )}
            </div>
          )}
          {recipe.notes && activeTab!=="foto" && activeTab!=="🛒 compras" && (
            <div style={{marginTop:20,background:T.notesBg,border:`1px solid ${T.notesBdr}`,borderRadius:12,padding:"14px 16px",fontSize:"0.88rem",color:T.textMid}}>
              <strong>📝 Nota:</strong> {recipe.notes}
            </div>
          )}
          {recipe.dica && activeTab!=="foto" && activeTab!=="🛒 compras" && (
            <div style={{marginTop:10,background:"#fff4e0",border:"1px solid #f5c97a",borderRadius:12,padding:"14px 16px",fontSize:"0.88rem",color:"#7a4f10",display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{fontSize:18,flexShrink:0}}>💡</span>
              <div><strong>Pulo do gato:</strong> {recipe.dica}</div>
            </div>
          )}
          {/* Botões de ação */}
          <div style={{display:"flex",gap:10,marginTop:24}}>
            <button onClick={()=>onEdit(recipe)} style={{flex:1,padding:"12px",border:`1.5px solid ${T.borderMid}`,borderRadius:12,background:"transparent",color:T.textMid,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              ✏️ Editar receita
            </button>
            <button onClick={()=>onShare(recipe)} style={{flex:1,padding:"12px",border:"none",borderRadius:12,background:T.header,color:T.accentLt,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              ↗ Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADD RECIPE MODAL ─────────────────────────────────────────────────────────
function AddRecipeModal({ onClose, onSave }) {
  const [form, setForm] = useState({name:"",category:"Prato Principal",complexity:"fácil",time:"",servings:"",ingredients:"",steps:"",notes:"",dica:"",tested:false,photo:null,fonte:"Receita da família"});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const photoInputRef = useRef();
  const handleSave = () => {
    if(!form.name.trim()||!form.time) return;
    onSave({...form,id:Date.now(),time:parseInt(form.time),servings:parseInt(form.servings)||4,ingredients:form.ingredients.split("\n").map(s=>s.trim()).filter(Boolean),steps:form.steps.split("\n").map(s=>s.trim()).filter(Boolean)});
    onClose();
  };
  const s={width:"100%",padding:"10px 14px",border:`1px solid ${T.borderMid}`,borderRadius:10,fontSize:14,color:T.text,background:T.bgCard,boxSizing:"border-box",fontFamily:T.font,outline:"none"};
  const L=({children})=><label style={{display:"block",fontSize:12,fontWeight:700,color:T.textMid,marginBottom:6,letterSpacing:0.5,textTransform:"uppercase"}}>{children}</label>;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(20,14,8,0.72)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:T.bgCard,borderRadius:20,maxWidth:500,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)",fontFamily:T.font}} onClick={e=>e.stopPropagation()}>
        <div style={{background:T.header,padding:"24px 28px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,color:T.accentLt,fontSize:"1.2rem"}}>+ Nova Receita</h2>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18}}>×</button>
        </div>
        <div style={{padding:"24px 28px"}}>
          <div style={{marginBottom:16}}><L>Nome da receita</L><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Ex: Bolo de Laranja" style={s}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><L>Categoria</L><select value={form.category} onChange={e=>set("category",e.target.value)} style={{...s,fontSize:13}}>{["Entrada","Prato Principal","Sobremesa","Lanche","Bebida","Outro"].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><L>Complexidade</L><select value={form.complexity} onChange={e=>set("complexity",e.target.value)} style={{...s,fontSize:13}}><option value="fácil">Fácil</option><option value="médio">Médio</option><option value="difícil">Difícil</option></select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><L>Tempo (min)</L><input type="number" value={form.time} onChange={e=>set("time",e.target.value)} placeholder="Ex: 45" style={s}/></div>
            <div><L>Porções</L><input type="number" value={form.servings} onChange={e=>set("servings",e.target.value)} placeholder="Ex: 4" style={s}/></div>
          </div>
          <div style={{marginBottom:16}}><L>Fonte / Inspiração</L><input value={form.fonte} onChange={e=>set("fonte",e.target.value)} placeholder="Ex: Vovó, Livro da Ana Maria, Instagram..." style={s}/></div>
          <div style={{marginBottom:16}}><L>Já foi testada?</L>
            <div style={{display:"flex",gap:8}}>
              {[true,false].map(val=>(
                <button key={String(val)} onClick={()=>set("tested",val)} style={{flex:1,padding:"10px",border:"1.5px solid",borderColor:form.tested===val?(val?"#2d6a2d":"#a02020"):T.borderMid,borderRadius:10,background:form.tested===val?(val?"#e8f5e8":"#fde8e8"):"transparent",color:form.tested===val?(val?"#2d6a2d":"#a02020"):T.textSoft,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:form.tested===val?700:400}}>
                  {val?"✅ Sim, já testei":"○ Ainda não testei"}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}><L>Foto do prato</L>
            <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>set("photo",ev.target.result);r.readAsDataURL(f);}}/>
            {form.photo ? (
              <div style={{position:"relative"}}><img src={form.photo} alt="" style={{width:"100%",height:160,objectFit:"cover",borderRadius:12,display:"block"}}/><button onClick={()=>set("photo",null)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:14}}>×</button></div>
            ) : (
              <button onClick={()=>photoInputRef.current.click()} style={{width:"100%",padding:16,border:`2px dashed ${T.borderMid}`,borderRadius:12,background:T.bgMuted,cursor:"pointer",color:T.textSoft,fontSize:13,display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:T.font}}>
                <span style={{fontSize:26}}>📷</span><span>Adicionar foto do prato</span>
              </button>
            )}
          </div>
          <div style={{marginBottom:16}}><L>Ingredientes (um por linha)</L><textarea value={form.ingredients} onChange={e=>set("ingredients",e.target.value)} rows={5} placeholder={"300g de farinha\n2 ovos"} style={{...s,fontSize:13,resize:"vertical",lineHeight:1.6}}/></div>
          <div style={{marginBottom:16}}><L>Modo de Preparo (um passo por linha)</L><textarea value={form.steps} onChange={e=>set("steps",e.target.value)} rows={5} placeholder={"Misture os secos.\nAdicione os ovos."} style={{...s,fontSize:13,resize:"vertical",lineHeight:1.6}}/></div>
          <div style={{marginBottom:16}}><L>Notas (opcional)</L><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Dicas, variações..." style={{...s,fontSize:13,resize:"vertical",lineHeight:1.6}}/></div>
          <div style={{marginBottom:20}}>
            <L>💡 Pulo do gato (opcional)</L>
            <textarea value={form.dica} onChange={e=>set("dica",e.target.value)} rows={2} placeholder="O segredo que faz toda a diferença nessa receita..." style={{...s,fontSize:13,resize:"vertical",lineHeight:1.6,borderColor:form.dica?"#d4a56a":undefined,background:form.dica?"#fff8ee":undefined}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"12px",border:`1px solid ${T.borderMid}`,borderRadius:12,background:"transparent",color:T.textSoft,cursor:"pointer",fontSize:14,fontFamily:T.font}}>Cancelar</button>
            <button onClick={handleSave} style={{flex:2,padding:"12px",border:"none",borderRadius:12,background:T.header,color:T.accentLt,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:T.font}}>Salvar Receita</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sincroniza com o Firebase em tempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "receitas"), (snapshot) => {
      const data = snapshot.docs.map(d => ({ ...d.data(), _fireId: d.id }));
      setRecipes(data.length > 0 ? data : initialRecipes);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveRecipe = async (recipe) => {
    const { _fireId, ...data } = recipe;
    if (_fireId) {
      await updateDoc(doc(db, "receitas", _fireId), data);
    } else {
      await addDoc(collection(db, "receitas"), data);
    }
  };

  const updateRecipes = (fn) => {
    // usado apenas localmente para atualizações otimistas
    setRecipes(prev => typeof fn === "function" ? fn(prev) : fn);
  };
  const [search, setSearch] = useState("");
  const [searchIngredient, setSearchIngredient] = useState("");
  const [filterComplexity, setFilterComplexity] = useState("todas");
  const [filterTime, setFilterTime] = useState("todos");
  const [filterCategory, setFilterCategory] = useState("todas");
  const [filterTested, setFilterTested] = useState("todas");
  const [filterFonte, setFilterFonte] = useState("todos");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [shareRecipe, setShareRecipe] = useState(null);
  const [editRecipe, setEditRecipe] = useState(null);

  const categories = ["todas",...Array.from(new Set(recipes.map(r=>r.category)))];

  const filtered = useMemo(()=>recipes.filter(r=>{
    const mS=r.name.toLowerCase().includes(search.toLowerCase());
    const mI=searchIngredient.trim()===""?true:r.ingredients.some(ing=>ing.toLowerCase().includes(searchIngredient.toLowerCase()));
    const mC=filterComplexity==="todas"||r.complexity===filterComplexity;
    const mCat=filterCategory==="todas"||r.category===filterCategory;
    const mTest=filterTested==="todas"?true:filterTested==="testadas"?r.tested:!r.tested;
    const mAuth=filterFonte==="todos"?true:(r.fonte||"").toLowerCase().includes(filterFonte.toLowerCase());
    const mT=filterTime==="todos"?true:filterTime==="rápido"?r.time<=30:filterTime==="médio"?r.time>30&&r.time<=60:r.time>60;
    return mS&&mI&&mC&&mT&&mCat&&mTest&&mAuth;
  }),[recipes,search,searchIngredient,filterComplexity,filterTime,filterCategory,filterTested,filterFonte]);

  const handleUpdate = async (u) => { await saveRecipe(u); setSelected(u); };
  const handleImported = async (r) => { await saveRecipe(r); };

  const Chip=({value,current,onClick,label,activeColor})=>(
    <button onClick={()=>onClick(value)} style={{padding:"7px 14px",borderRadius:20,border:"1.5px solid",borderColor:current===value?(activeColor||T.header):T.borderMid,background:current===value?(activeColor||T.header):"transparent",color:current===value?(activeColor?"#fff":T.accentLt):T.textSoft,cursor:"pointer",fontSize:13,fontWeight:current===value?700:400,fontFamily:T.font,whiteSpace:"nowrap",transition:"all 0.18s"}}>{label}</button>
  );

  const testedCount=recipes.filter(r=>r.tested).length;
  const comFonte=recipes.filter(r=>r.fonte&&r.fonte.trim()).length;

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.font}}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet"/>

      {loading && (
        <div style={{position:"fixed",inset:0,background:T.header,zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
          <svg width="80" height="60" viewBox="0 0 160 96" fill="none">
            <path d="M52 28 Q47 18 52 8" stroke="#d4a56a" strokeWidth="2.4" strokeLinecap="round" opacity="0.65"/>
            <path d="M80 23 Q75 13 80 3" stroke="#d4a56a" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M108 28 Q103 18 108 8" stroke="#d4a56a" strokeWidth="2.4" strokeLinecap="round" opacity="0.65"/>
            <path d="M36 44 Q36 34 80 34 Q124 34 124 44 L122 50 Q80 50 38 50 Z" fill="#7a3f18"/>
            <rect x="68" y="27" width="24" height="10" rx="5" fill="#7a3f18"/>
            <path d="M38 50 Q36 82 80 82 Q124 82 122 50 Z" fill="#5a3010"/>
            <path d="M38 62 C38 62 28 62 24 58 C20 54 20 48 24 45 C26 43 29 43 31 45 C33 43 36 43 38 45 C40 48 39 53 36 56 Z" fill="#d4a56a" opacity="0.85"/>
            <path d="M122 62 C122 62 132 62 136 58 C140 54 140 48 136 45 C134 43 131 43 129 45 C127 43 124 43 122 45 C120 48 121 53 124 56 Z" fill="#d4a56a" opacity="0.85"/>
          </svg>
          <div style={{color:T.accentLt,fontFamily:T.fontDisplay,fontSize:"1.4rem",fontWeight:700}}>EduCau & Filhos</div>
          <div style={{color:T.textSoft,fontSize:12,letterSpacing:3,textTransform:"uppercase"}}>carregando receitas...</div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{background:T.header,padding:"32px 24px 28px",textAlign:"center"}}>

        {/* Logo SVG */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <svg width="150" height="90" viewBox="0 0 160 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M52 28 Q47 18 52 8"  stroke="#d4a56a" strokeWidth="2.4" strokeLinecap="round" opacity="0.65"/>
            <path d="M80 23 Q75 13 80 3"  stroke="#d4a56a" strokeWidth="2.4" strokeLinecap="round" opacity="1"/>
            <path d="M108 28 Q103 18 108 8" stroke="#d4a56a" strokeWidth="2.4" strokeLinecap="round" opacity="0.65"/>
            <path d="M36 44 Q36 34 80 34 Q124 34 124 44 L122 50 Q122 50 80 50 Q38 50 38 50 Z" fill="#7a3f18"/>
            <ellipse cx="65" cy="40" rx="14" ry="3.5" fill="#d4a56a" opacity="0.1"/>
            <rect x="68" y="27" width="24" height="10" rx="5" fill="#7a3f18"/>
            <ellipse cx="80" cy="27" rx="7" ry="3.5" fill="#9a4f20"/>
            <path d="M38 50 Q36 82 80 82 Q124 82 122 50 Z" fill="#5a3010"/>
            <ellipse cx="65" cy="60" rx="13" ry="5" fill="#d4a56a" opacity="0.07"/>
            <ellipse cx="80" cy="84" rx="34" ry="5" fill="#000" opacity="0.13"/>
            <path d="M38 62 C38 62 28 62 24 58 C20 54 20 48 24 45 C26 43 29 43 31 45 C33 43 36 43 38 45 C40 48 39 53 36 56 Z" fill="#d4a56a" opacity="0.85"/>
            <path d="M122 62 C122 62 132 62 136 58 C140 54 140 48 136 45 C134 43 131 43 129 45 C127 43 124 43 122 45 C120 48 121 53 124 56 Z" fill="#d4a56a" opacity="0.85"/>
          </svg>
        </div>

        {/* receitas da família — linha */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:10}}>
          <div style={{height:1,width:36,background:T.accentLt,opacity:0.35}}/>
          <div style={{fontSize:9,letterSpacing:4,color:T.accentLt,textTransform:"uppercase",opacity:0.8,whiteSpace:"nowrap"}}>
            ◆ receitas da família ◆
          </div>
          <div style={{height:1,width:36,background:T.accentLt,opacity:0.35}}/>
        </div>

        {/* Nome */}
        <h1 style={{margin:0,fontFamily:T.fontDisplay,fontWeight:900,fontSize:"clamp(1.8rem,7vw,2.8rem)",color:T.accentPale,lineHeight:1,letterSpacing:-0.5}}>
          Edu<span style={{color:T.accentLt}}>C</span>au
        </h1>
        <div style={{fontFamily:T.fontDisplay,fontWeight:700,fontStyle:"italic",fontSize:"1rem",color:T.accentLt,letterSpacing:3,textTransform:"uppercase",marginTop:3}}>
          &amp; Filhos
        </div>
        <div style={{fontFamily:T.font,fontSize:"0.68rem",color:"#a07858",letterSpacing:5,textTransform:"uppercase",marginTop:8}}>
          na Cozinha
        </div>

        {/* ornamento */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:12,marginBottom:12}}>
          <div style={{height:1,width:36,background:T.accentLt,opacity:0.35}}/>
          <span style={{fontSize:8,color:T.accentLt,opacity:0.5}}>◆</span>
          <div style={{height:1,width:36,background:T.accentLt,opacity:0.35}}/>
        </div>

        {/* Contadores */}
        <div style={{fontSize:12,color:"#8a6040",display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:18}}>
          <span>{recipes.length} receitas</span>
          <span>·</span>
          <span>{testedCount} testadas ✅</span>
          <span>·</span>
          <span>{comFonte} com fonte 📖</span>
        </div>

        {/* Botões */}
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setShowImport(true)} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"9px 16px",cursor:"pointer",color:T.accentPale,fontSize:12,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",gap:5}}>
            📥 Importar
          </button>
          <button onClick={()=>setShowAdd(true)} style={{background:T.accentLt,border:"none",borderRadius:20,padding:"9px 16px",cursor:"pointer",color:T.header,fontSize:12,fontWeight:700,fontFamily:T.font,display:"flex",alignItems:"center",gap:5}}>
            + Nova Receita
          </button>
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"0 16px 48px"}}>
        {/* Search */}
        <div style={{padding:"20px 0 4px",display:"flex",flexDirection:"column",gap:8}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:T.textSoft}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar pelo nome da receita..." style={{width:"100%",padding:"11px 14px 11px 42px",borderRadius:14,border:`1.5px solid ${T.borderMid}`,background:T.bgCard,fontSize:14,color:T.text,fontFamily:T.font,boxSizing:"border-box",outline:"none"}}/>
          </div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:T.textSoft}}>🥩</span>
            <input value={searchIngredient} onChange={e=>setSearchIngredient(e.target.value)} placeholder="Tenho em casa... (ex: filé mignon, salmão)" style={{width:"100%",padding:"11px 14px 11px 42px",borderRadius:14,border:`1.5px solid ${searchIngredient?T.accent:T.borderMid}`,background:searchIngredient?"#fff8f0":T.bgCard,fontSize:14,color:T.text,fontFamily:T.font,boxSizing:"border-box",outline:"none",transition:"all 0.2s"}}/>
            {searchIngredient && (
              <button onClick={()=>setSearchIngredient("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textSoft,fontSize:16,padding:0}}>×</button>
            )}
          </div>
          {searchIngredient && (
            <div style={{fontSize:12,color:T.accent,fontWeight:600,paddingLeft:4}}>
              🥩 Mostrando receitas com "{searchIngredient}" — {filtered.length} encontrada{filtered.length!==1?"s":""}
            </div>
          )}
        </div>

        {/* Filters */}
        {[
          {label:"Fonte", chips:[["todos","Todas"],["família","👨‍👩‍👧‍👦 Família"],["livro","📚 Livro"],["internet","🌐 Internet"]], state:filterFonte, set:setFilterFonte},
          {label:"Status", chips:[["todas","Todas"],["testadas","✅ Testadas"],["nao-testadas","○ Não testadas"]], state:filterTested, set:setFilterTested, colors:{"testadas":"#2d6a2d","nao-testadas":"#8a5a20"}},
          {label:"Complexidade", chips:[["todas","Todas"],["fácil","Fácil"],["médio","Médio"],["difícil","Difícil"]], state:filterComplexity, set:setFilterComplexity},
          {label:"Tempo de Preparo", chips:[["todos","Todos"],["rápido","Até 30 min"],["médio","30–60 min"],["longo","Mais de 1h"]], state:filterTime, set:setFilterTime},
          {label:"Categoria", chips:categories.map(c=>[c,c==="todas"?"Todas":c]), state:filterCategory, set:setFilterCategory},
        ].map(f=>(
          <div key={f.label} style={{marginBottom:4}}>
            <div style={{fontSize:10,letterSpacing:2,color:T.accentLt,textTransform:"uppercase",marginBottom:7,marginTop:14,fontWeight:700}}>{f.label}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {f.chips.map(([v,l])=><Chip key={v} value={v} current={f.state} onClick={f.set} label={l} activeColor={f.colors?.[v]}/>)}
            </div>
          </div>
        ))}

        <div style={{fontSize:13,color:T.textSoft,margin:"20px 0 12px"}}>
          {filtered.length===0?"Nenhuma receita encontrada":`${filtered.length} receita${filtered.length>1?"s":""} encontrada${filtered.length>1?"s":""}`}
        </div>

        {/* Cards */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {filtered.map(recipe=>{
            const col=complexityColors[recipe.complexity];
            return (
              <div key={recipe.id} onClick={()=>setSelected(recipe)} style={{background:T.bgCard,borderRadius:16,boxShadow:"0 2px 12px rgba(44,26,14,0.07)",cursor:"pointer",border:`1px solid ${T.border}`,transition:"transform 0.15s,box-shadow 0.15s",overflow:"hidden"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(44,26,14,0.13)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(44,26,14,0.07)";}}>
                {recipe.photo&&<img src={recipe.photo} alt={recipe.name} style={{width:"100%",height:140,objectFit:"cover",display:"block"}}/>}
                <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div>
                      <div style={{fontSize:10,color:T.accentLt,letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>
                        {categoryIcons[recipe.category]||"🍴"} {recipe.category}
                        {recipe.fonte && <span style={{color:T.textFaint,marginLeft:6}}>· {recipe.fonte}</span>}
                      </div>
                      <h3 style={{margin:0,fontSize:"1rem",color:T.text,fontWeight:700,lineHeight:1.3}}>{recipe.name}</h3>
                    </div>
                    {!recipe.photo&&<span style={{fontSize:20,flexShrink:0}}>{categoryIcons[recipe.category]||"🍴"}</span>}
                  </div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    <span style={{background:col.bg,color:col.text,border:`1px solid ${col.border}`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{recipe.complexity.charAt(0).toUpperCase()+recipe.complexity.slice(1)}</span>
                    <span style={{background:T.bgMuted,color:T.textMid,borderRadius:20,padding:"3px 10px",fontSize:11}}>⏱ {timeLabel(recipe.time)}</span>
                    <span style={{background:T.bgMuted,color:T.textMid,borderRadius:20,padding:"3px 10px",fontSize:11}}>👥 {recipe.servings} porções</span>
                    {recipe.tested&&<span style={{background:"#e8f5e8",color:"#2d6a2d",border:"1px solid #a3d9a3",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>✅ Testada</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"48px 0",color:T.textFaint}}>
            <div style={{fontSize:48,marginBottom:12}}>🍽️</div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>Nenhuma receita encontrada</div>
            <div style={{fontSize:13}}>Tente outros filtros ou adicione uma nova receita</div>
          </div>
        )}

        {/* Footer */}
        <div style={{textAlign:"center",marginTop:40,paddingTop:24,borderTop:`1px solid ${T.border}`,color:T.textFaint,fontSize:12}}>
          🍽️ Educau & Filhos na Cozinha
        </div>
      </div>

      {selected&&<RecipeModal recipe={selected} onClose={()=>setSelected(null)} onUpdate={handleUpdate} onShare={r=>{setSelected(null);setShareRecipe(r);}} onEdit={r=>{setSelected(null);setEditRecipe(r);}}/>}
      {showAdd&&<AddRecipeModal onClose={()=>setShowAdd(false)} onSave={async r=>{await saveRecipe(r);}}/>}
      {showImport&&<ImportModal onClose={()=>setShowImport(false)} onImported={handleImported}/>}
      {shareRecipe&&<ShareModal recipe={shareRecipe} onClose={()=>setShareRecipe(null)}/>}
      {editRecipe&&<EditRecipeModal recipe={editRecipe} onClose={()=>setEditRecipe(null)} onSave={async r=>{await handleUpdate(r); setEditRecipe(null);}}/>}
    </div>
  );
}