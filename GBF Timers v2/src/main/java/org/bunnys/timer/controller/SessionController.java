package org.bunnys.timer.controller;

import org.bunnys.timer.models.Session;
import org.bunnys.timer.services.SessionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/sessions")
public class SessionController {
    private final SessionService service;

    public SessionController(SessionService service) {
        this.service = service;
    }

    @PostMapping
    public Session addSession(@RequestBody Session session) {
        return service.addSession(session);
    }

    @GetMapping
    public List<Session> getAllSessions() {
        return service.getAllSessions();
    }

    @GetMapping("/{id}")
    public Optional<Session> getSessionById(@PathVariable String id) {
        return service.getSessionById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSession(@PathVariable String id) {
        service.deleteSession(id);
    }
}
