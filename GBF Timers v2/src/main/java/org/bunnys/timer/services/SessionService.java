package org.bunnys.timer.services;

import org.bunnys.timer.models.Session;
import org.bunnys.timer.repositories.SessionRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {
    private final SessionRepository repository;

    public SessionService(SessionRepository repository) {
        this.repository = repository;
    }

    public Session addSession(Session session) {
        return repository.save(session);
    }

    public List<Session> getAllSessions() {
        return repository.findAll();
    }

    public Optional<Session> getSessionById(String id) {
        return repository.findById(id);
    }

    public void deleteSession(String id) {
        repository.deleteById(id);
    }
}
